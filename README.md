# YaSMD (Yet another Smart Meter Dashboard)
An other python script to read the smart meter and write
 values to a csv file. This project also has a webinterface that can visualize the csv files.
 All the charts from this dashboard are render by the webbrowser.
 The dashboard has a line chart of current power.
 And there is a line chart of gas use per hour.
 And there is a bar chart with the gas use per day.

### Python3 dependencies
PySerial is needed for reading the P1 port on the smart meter.
PyCurl is used for getting the hourly outside temperature data.
```shell
pip3 install pycurl pyserial
```

### crontab entries
```shell
# Read smart meter every 5 minutes.
*/5 * * * * /usr/bin/nice -n 18 /usr/bin/python3 /home/pi/read_smartmeter_p1port.py >>/home/pi/read_smartmeter_p1port.log 2>&1

# Create new daily csv file. etc.
59 23 * * * /usr/bin/nice -n 10 sh /home/pi/rotate_csv_files.sh >>/home/pi/rotate_csv_files.log 2>&1
```

### Extending MicroSD card lifespan with tmpfs caching.
If you use this on a rasberry Pi with a MicroSD card, 
the MicroSD lifespan can be short because of a lot of short writes for each line 
using a new sector. To avoid that a tmpfs drive on /var/cache/yasmd must be created
 and then multiple lines will be writen at once if certain size(508bytes) has been reached.

To setup the tmpfs drive run:
```shell
sudo mkdir -p /var/cache/yasmd
```
And to the /etc/fstab file is added:
```shell
tmpfs /var/cache/yasmd tmpfs defaults,noatime,nodiratime,noexec,nodev,size=4M 0 0
```

And then check fstab with:
```shell
sudo findmnt --verify
```
If no issues are found reboot the pi or run sudo mount -a to actualy start using the tmpfs drive.
