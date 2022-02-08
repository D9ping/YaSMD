#!/usr/bin/env python3
# -*- coding: ascii -*-
# pylint: disable=C0321
import sys
if sys.version_info.major < 3: sys.exit('Python version 2(or lower) is not supported.')

import time
import serial
import datetime
from pathlib import Path
import pycurl
import json
from io import BytesIO


WEBINTERFACEROOTFOLDER = '/var/www/yasmd/'
TMPFSDRIVE = '/var/cache/yasmd/'
PREV_GAS_USE_COUNTERFILE = TMPFSDRIVE + 'yasmd-prev-gas-use.counter'
WRITECACHE_TMPFILEPATH = TMPFSDRIVE + 'data.csv.new'
DATA_FILEPATH = WEBINTERFACEROOTFOLDER + 'data.csv'
OPENWEATHERMAPAPIKEY = ''
OPENWEATHERMCITYID = ''

# Set COM port config
ser = serial.Serial()
ser.baudrate = 115200
ser.bytesize=serial.EIGHTBITS
ser.parity=serial.PARITY_NONE
ser.stopbits=serial.STOPBITS_ONE
ser.xonxoff=0
ser.rtscts=0
#ser.timeout=20
ser.timeout=29
ser.port="/dev/ttyUSB0"

# Open COM port
try:
    ser.open()
except:
    nowExcOpen = datetime.datetime.now()
    sys.exit("%s Error opening %s "  % (nowExcOpen.strftime("%Y-%m-%d %H:%M:%S"), ser.name))

maxlines = 26
p1_counter = 0
stack_counter = 0
p1_line = ''
stack = []

while p1_counter < maxlines:
    try:
        p1_raw = ser.readline()
    except:
        nowExcRead = datetime.datetime.now()
        sys.exit("%s Serial port %s could not be read." % (nowExcOpen.strftime("%Y-%m-%d %H:%M:%S"), ser.name))
    p1_str = str(p1_raw.decode('UTF-8'))
    p1_line = p1_str.strip()
    stack.append(p1_line)
    p1_counter += 1

now = datetime.datetime.now()
piekverbruik = 0
piekterug = ""
dalverbruik = 0
dalterug = 0
vermogenterug = ""
vermogenaf = ""
gas = ""
while stack_counter < maxlines:
    if stack[stack_counter][0:9] == "1-0:1.8.1":
        dalverbruik = float(stack[stack_counter][10:20])
    elif stack[stack_counter][0:9] == "1-0:1.8.2":
        piekverbruik = float(stack[stack_counter][10:20])
    # Daltarief, teruggeleverd vermogen 1-0:2.8.1
    elif stack[stack_counter][0:9] == "1-0:2.8.1":
        dalterug = float(stack[stack_counter][10:20])
    # Piek tarief, teruggeleverd vermogen 1-0:2.8.2
    elif stack[stack_counter][0:9] == "1-0:2.8.2":
        piekterug = str(float(stack[stack_counter][10:20]))
    # Huidige stroomafname: 1-0:1.7.0
    elif stack[stack_counter][0:9] == "1-0:1.7.0":
        vermogenaf = str(int(float(stack[stack_counter][10:16])*1000))
    # Huidig teruggeleverd vermogen: 1-0:1.7.0
    elif stack[stack_counter][0:9] == "1-0:2.7.0":
        vermogenterug = str(int(float(stack[stack_counter][10:16])*1000))
    # Huidige netspanning: 1-0:32.7.0
    #elif stack[stack_counter][0:10] == "1-0:32.7.0":
    #    spanning = float(stack[stack_counter][11:14])
    # Gasmeter: 0-1:24.2.1
    elif stack[stack_counter][0:10] == "0-1:24.2.1":
        gas = str(float(stack[stack_counter][26:34]))
    else:
        pass
    stack_counter = stack_counter +1


TARGET_SECTORSIZE = 508
writecachedata_filesize = 0
if Path(WRITECACHE_TMPFILEPATH).is_file():
    writecachedata_filesize = Path(WRITECACHE_TMPFILEPATH).stat().st_size
line = ("%s,%0.1f,%0.1f,%0.1f,%s,%s,%s,%s\n" % (now.strftime("%Y-%m-%d %H:%M:%S"), dalverbruik, piekverbruik, dalterug, piekterug, vermogenaf, vermogenterug, gas))
writecache_newsize = writecachedata_filesize + len(line)
if writecache_newsize >= TARGET_SECTORSIZE:
    with open(WRITECACHE_TMPFILEPATH, 'r') as tmpfile, open(DATA_FILEPATH, 'a') as persistentfile:
        for linetmpfile in tmpfile:
             persistentfile.write(linetmpfile)
        persistentfile.write(line)
    Path(WRITECACHE_TMPFILEPATH).unlink()
else:
    with open(WRITECACHE_TMPFILEPATH, 'a') as tmpfile:
        tmpfile.write(line)
# Deprecated:
#with open(WEBINTERFACEROOTFOLDER + "data.csv", "a") as csvfile:
#    csvfile.write("%s,%0.1f,%0.1f,%0.1f,%0.1f,%s,%s,%s\n" % (now.strftime("%Y-%m-%d %H:%M:%S"), dalverbruik, piekverbruik, dalterug, piekterug, vermogenaf, vermogenterug, gas))


time_cur_minut = int(time.strftime("%M"))
if time_cur_minut == 0:
    outside_local_temperature = ""
    if OPENWEATHERMAPAPIKEY != '':
        bytesOpenWeathermap = BytesIO()
        curlOpenWeatherData = pycurl.Curl()
        try:
            curlOpenWeatherData.setopt(curlOpenWeatherData.URL, 'https://api.openweathermap.org/data/2.5/weather?id=' + OPENWEATHERMCITYID + '&mode=json&lang=nl&units=metric&APPID=' + OPENWEATHERMAPAPIKEY)
            curlOpenWeatherData.setopt(curlOpenWeatherData.USERAGENT, 'YASMM/0.5')
            curlOpenWeatherData.setopt(pycurl.FOLLOWLOCATION, 0)
            curlOpenWeatherData.setopt(pycurl.CONNECTTIMEOUT, 45)
            curlOpenWeatherData.setopt(pycurl.TIMEOUT, 50)
            # api.openweathermap.org is using HTTP 1.1, force to use that.
            curlOpenWeatherData.setopt(pycurl.HTTP_VERSION, pycurl.CURL_HTTP_VERSION_1_1)
            # api.openweathermap.org is not allowed to fallback to TLS 1.1 and ealier.
            curlOpenWeatherData.setopt(pycurl.SSLVERSION, pycurl.SSLVERSION_TLSv1_2)
            curlOpenWeatherData.setopt(curlOpenWeatherData.WRITEDATA, bytesOpenWeathermap)
            curlOpenWeatherData.perform()
            status_code_openweathermap = curlOpenWeatherData.getinfo(pycurl.RESPONSE_CODE)
            if status_code_openweathermap != 200:
                print("%s Error got status code: %d from api.openweathermap.org." % (now.strftime("%Y-%m-%d %H:%M:%S"), status_code_openweathermap))
        except:
            print("%s Error getting outside local temperature." % now.strftime("%Y-%m-%d %H:%M:%S"))
        finally:
            curlOpenWeatherData.close()
        weatherResponseBytes = bytesOpenWeathermap.getvalue()
        weatherResponseSize = len(weatherResponseBytes)
        if weatherResponseSize > 0 and weatherResponseSize < 8192:
            weatherJsonStr = weatherResponseBytes.decode('utf-8')
            jsonData = json.loads(weatherJsonStr)
            if not jsonData["main"]["temp"]:
                print("%s Error openweathermap does not contains main.temp" % now.strftime("%Y-%m-%d %H:%M:%S"))
            else:
                outside_local_temperature = str(jsonData["main"]["temp"])
    if Path(PREV_GAS_USE_COUNTERFILE).is_file():
        with open(PREV_GAS_USE_COUNTERFILE, "r") as gastotal_counterfile:
            prev_gas_total = float(gastotal_counterfile.read())
        gas_hour = float(gas) - prev_gas_total
        with open(WEBINTERFACEROOTFOLDER + "gasuse.csv", "a") as gas_use_csvfile:
            gas_use_csvfile.write("%s,%0.3f,%s\r\n" % (now.strftime("%Y-%m-%d %H:%M:%S"), gas_hour, outside_local_temperature))
    # Update temporary file.
    with open(PREV_GAS_USE_COUNTERFILE, "w") as gastotal_counterfile:
        gastotal_counterfile.write(str(gas))
