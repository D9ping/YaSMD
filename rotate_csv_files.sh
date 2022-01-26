#!/usr/bin/env sh

freediskspace=$(df -m --local --output=avail / | tail -n 1)
if [ "${freediskspace}" -lt 1024 ];
then
   #echo "There is less than 1 GiB free diskspace. exit now."
   exit 1
fi

WEBINTERFACEROOTFOLDER="/var/www/yasmd/"
# debug:
#head -n 2 "${WEBINTERFACEROOTFOLDER}data.csv" | tail -n 1 | cut -d ',' -f 8

DATETODAY=$(date +%Y-%m-%d)
CURYEAR=$(date +%Y)
YEARMONTH=$(date +%Y-%m)
if [ -f "/var/cache/yasmd/data.csv.new" ];
then
    cat "${WEBINTERFACEROOTFOLDER}data.csv.new" >> "${WEBINTERFACEROOTFOLDER}data.csv"
    rm "${WEBINTERFACEROOTFOLDER}data.csv.new"
fi

if [ ! -d "${WEBINTERFACEROOTFOLDER}${CURYEAR}/" ];
then
    mkdir -p "${WEBINTERFACEROOTFOLDER}${CURYEAR}/"
fi

mv --backup=numbered -f "${WEBINTERFACEROOTFOLDER}data.csv" "${WEBINTERFACEROOTFOLDER}${CURYEAR}/data_${DATETODAY}.csv"
cp "${WEBINTERFACEROOTFOLDER}data_header.csv" "${WEBINTERFACEROOTFOLDER}data.csv"

mv --backup=numbered -f "${WEBINTERFACEROOTFOLDER}gasuse.csv" "${WEBINTERFACEROOTFOLDER}${CURYEAR}/gasuse_${DATETODAY}.csv"
cp "${WEBINTERFACEROOTFOLDER}gasuse_header.csv" "${WEBINTERFACEROOTFOLDER}gasuse.csv"

# Gas and temperature day file
GAS_TOTAL_DAY_START=$(head -n 2 "${WEBINTERFACEROOTFOLDER}${CURYEAR}/data_${DATETODAY}.csv" | tail -n 1 | cut -d ',' -f 8 | tr -d '\r\n' )
if [ -z "${GAS_TOTAL_DAY_START}" ];
then
    DATETIMELOGENTRY=$(date "+%Y-%m-%d %H:%M:%S")
    echo "${DATETIMELOGENTRY} Warning: could not get gas total of the day end. Tried 2nd line from top."
    GAS_TOTAL_DAY_START=$(head -n 3 "${WEBINTERFACEROOTFOLDER}${CURYEAR}/data_${DATETODAY}.csv" | tail -n 1 | cut -d ',' -f 8 | tr -d '\r\n')
    if [ -z "${GAS_TOTAL_DAY_START}" ];
    then
        DATETIMELOGENTRY=$(date "+%Y-%m-%d %H:%M:%S")
        echo "${DATETIMELOGENTRY} Warning: could not get gas total of the day start. Tried 3th line from top."
        GAS_TOTAL_DAY_START=$(head -n 4 "${WEBINTERFACEROOTFOLDER}${CURYEAR}/data_${DATETODAY}.csv" | tail -n 1 | cut -d ',' -f 8 | tr -d '\r\n')
        if [ -z "${GAS_TOTAL_DAY_START}" ];
        then
            DATETIMELOGENTRY=$(date "+%Y-%m-%d %H:%M:%S")
            echo "${DATETIMELOGENTRY} Error: could not get gas total of the day start."
        fi
    fi
fi

GAS_TOTAL_DAY_END=$(tail -n 1 "${WEBINTERFACEROOTFOLDER}${CURYEAR}/data_${DATETODAY}.csv" | cut -d ',' -f 8 | tr -d '\r\n' )
if [ -z "${GAS_TOTAL_DAY_END}" ];
then
    DATETIMELOGENTRY=$(date "+%Y-%m-%d %H:%M:%S")
    echo "${DATETIMELOGENTRY} Warning: could not get gas total of the day end. Tried 1st line from bottom."
    GAS_TOTAL_DAY_END=$(tail -n 2 "${WEBINTERFACEROOTFOLDER}${CURYEAR}/data_${DATETODAY}.csv" | head -n 1 | cut -d ',' -f 8 | tr -d '\r\n' )
    if [ -z "${GAS_TOTAL_DAY_END}" ];
    then
        DATETIMELOGENTRY=$(date "+%Y-%m-%d %H:%M:%S")
        echo "${DATETIMELOGENTRY} Warning: could not get gas total of the day end. Tried 2nd line from bottom."
        GAS_TOTAL_DAY_END=$(tail -n 3 "${WEBINTERFACEROOTFOLDER}${CURYEAR}/data_${DATETODAY}.csv" | head -n 1 | cut -d ',' -f 8 | tr -d '\r\n' )
        if [ -z "${GAS_TOTAL_DAY_END}" ];
        then
            DATETIMELOGENTRY=$(date "+%Y-%m-%d %H:%M:%S")
            echo "${DATETIMELOGENTRY} Error: could not get gas total of the day end."
        fi
    fi
fi

# Gas month file
if [ ! -f "${WEBINTERFACEROOTFOLDER}${CURYEAR}/gasuse_${YEARMONTH}.csv" ];
then
    # write csv header
    echo "date,gas m3" >> "${WEBINTERFACEROOTFOLDER}${CURYEAR}/gasuse_${YEARMONTH}.csv"
fi

if [ -n "${GAS_TOTAL_DAY_END}" ] && [ -n "${GAS_TOTAL_DAY_START}" ];
then
    GAS_USE_TODAY=$(echo "${GAS_TOTAL_DAY_END} - ${GAS_TOTAL_DAY_START}" | bc -l )
    echo "${DATETODAY},${GAS_USE_TODAY}" >> "${WEBINTERFACEROOTFOLDER}${CURYEAR}/gasuse_${YEARMONTH}.csv"
else
    echo "${DATETODAY}," >> "${WEBINTERFACEROOTFOLDER}${CURYEAR}/gasuse_${YEARMONTH}.csv"
fi
