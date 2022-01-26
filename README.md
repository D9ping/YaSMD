# YaSMD (Yet another Smart Meter Dashboard)
An other python script to read the smart meter and write
 values to a csv file. This project also has a webinterface that can visualize the csv files.
 All the charts from this dashboard are render by the webbrowser.
 The dashboard has a line chart of current power.
 And there is a line chart of gas use per hour.
 And there is a bar chart with the gas use per day.

### crontab entries
```shell
# Read smart meter every 5 minutes.
*/5 * * * * /usr/bin/nice -n 18 /usr/bin/python3 /home/pi/read_smartmeter_p1port.py >>/home/pi/read_smartmeter_p1port.log 2>&1

# Create new daily csv file. etc.
59 23 * * * /usr/bin/nice -n 10 sh /home/pi/rotate_csv_files.sh >>/home/pi/rotate_csv_files.log 2>&1
```

Because writing often little data to a sd-card can wear it quickly
 YaSMD uses a tmpfs memory drive to collect multiple lines for the csv file
 and then write them at once.

run: sudo mkdir -p /var/cache/yasmd
And to the /etc/fstab file is added:
```shell
tmpfs /var/cache/yasmd tmpfs defaults,noatime,nodiratime,noexec,nodev,size=4M 0 0
```