#!/usr/bin/env sh

freediskspace=$(df -m --local --output=avail / | tail -n 1)
if [ "${freediskspace}" -lt 1024 ];
then
   #echo "There is less than 1 GiB free diskspace. exit now."
   exit 1
fi

readonly WEBINTERFACEROOTFOLDER="/var/www/yasmd/"
readonly CSVCACHEFOLDER="/var/cache/yasmd/"

DATETODAY=$(date +%Y-%m-%d)
CURYEAR=$(date +%Y)
YEARMONTH=$(date +%Y-%m)
# Write tmpfs csv file cache to data.csv.
if [ -f "${CSVCACHEFOLDER}data.csv.new" ];
then
    cat "${CSVCACHEFOLDER}data.csv.new" >> "${WEBINTERFACEROOTFOLDER}data.csv"
    rm "${CSVCACHEFOLDER}data.csv.new"
fi

# Create new year folder if not exist.
if [ ! -d "${WEBINTERFACEROOTFOLDER}${CURYEAR}/" ];
then
    mkdir -p "${WEBINTERFACEROOTFOLDER}${CURYEAR}/"
fi

# Rotate data.csv file with all smart meter data of the day.
mv --backup=numbered -f "${WEBINTERFACEROOTFOLDER}data.csv" "${WEBINTERFACEROOTFOLDER}${CURYEAR}/data_${DATETODAY}.csv"
cp "${WEBINTERFACEROOTFOLDER}data_header.csv" "${WEBINTERFACEROOTFOLDER}data.csv"
# Rotate gasuse.csv file with gas use per hour calculate from data.csv and optional the temperature at that hour.
mv --backup=numbered -f "${WEBINTERFACEROOTFOLDER}gasuse.csv" "${WEBINTERFACEROOTFOLDER}${CURYEAR}/gasuse_${DATETODAY}.csv"
cp "${WEBINTERFACEROOTFOLDER}gasuse_header.csv" "${WEBINTERFACEROOTFOLDER}gasuse.csv"

# Get gas total from begin of the day
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

# Get gas total from the end of the day
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

# Update total gas use per day csv file
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
