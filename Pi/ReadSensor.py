import RPi.GPIO as GPIO
import time, sys
import pymysql
import random
from datetime import datetime
from UtilityFunctions import *

global progstart
progstart = time.time()
startTime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

#FLOW_SENSOR = int(sys.argv[1])
#USER_ID     = str(sys.arg[2])

GPIO.setmode(GPIO.BCM)
GPIO.setup(FLOW_SENSOR, GPIO.IN, pull_up_down = GPIO.PUD_UP)

global count
count = 0

def countPulse(FLOW_SENSOR):
    global count
    if count == 0:
        startTime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    if start_counter == 1:
        count = count + 1

GPIO.add_event_detect(FLOW_SENSOR, GPIO.BOTH, callback = countPulse)

while True:
    try:
        curr_time = time.time()
        if(curr_time - progstart > 60.00):
            progstart = curr_time
            print(progstart)
            syncUser()
            storeMongo()
            print("Synced with server data")
        c_old = count
        if(count != 0 ):
            print(count)
        start_counter = 1
        if(c_old == count):
            time.sleep(10)
            if(count == c_old and count != 0):
                endTime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                storeValuesMysql(USER_ID,FLOW_SENSOR,count,startTime,endTime)
                count = 0
                c_old = 0
        time.sleep(0)
    except KeyboardInterrupt:
        print '\n Done\n'
        GPIO.cleanup()
        sys.exit()
