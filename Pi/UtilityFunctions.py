#!/usr/bin/python
#UtilityFunctions.py

import random
import time
import pymysql
import os
import errno
import pymysql
import demjson
from pymongo import MongoClient
from datetime import datetime

#-----Constants
ABHISHEK_IP     = "192.168.1.105"
RAHUL_IP        = "192.168.1.106"
PRANAV_IP       = "192.168.1.107"
ABHISHEK_USER   = "abhishekpawar"
RAHUL_USER      = "rahulpadalkar"
PRANAV_USER     = "pranavparakh"

#-----Configuration
IP_ADDRESS      = RAHUL_IP
FLOW_SENSOR     = 15
USER_ID         = RAHUL_USER

#-----funtions---

def connectMysql():
    mysqlConnection     = pymysql.connect(host = "192.168.1.100", port = 3306, user = 'root', passwd= 'rcoold' , db='alldata')
    mysqlCursor         = mysqlConnection.cursor()
    mysqlTuple          = (mysqlConnection, mysqlCursor)
    return mysqlTuple

def disconnectMysql(mysqlTuple):
    mysqlTuple[0].commit()
    mysqlTuple[1].close()
    mysqlTuple[0].close()

def connectMongo(IP_ADDRESS):
    mongoConnection     = MongoClient(IP_ADDRESS,27017)
    mongoDb             = mongoConnection.alldata
    mongoTuple          = (mongoConnection, mongoDb)
    return mongoTuple

def disconnectMongo(mongoTuple):
    mongoTuple[0].close()

def openLogFile():
    if os.path.exists("Log"):
        os.chdir("Log")
    else:
        os.makedirs("Log")    
    fileName            = str(datetime.now().strftime('%Y%m%d%H%M%S--')) + str('%.3f--'%(random.random())) + "data.txt"
    logFile             = open(fileName, "w")
    logFile.write("Data Recieved is : ")
    return logFile

def writeSelectMysqlLogFile(logFile, mysqlCursor):
    mysqlCursor.execute(" SELECT * FROM logs")
    cursorList          = mysqlCursor.fetchall()
    count               = 1
    for row in cursorList:
        logFile.write( "\n[" + str(count) + "]" + str(row))
        count = count + 1
    return logFile

def writeSelectMongoLogFile(logFile, mongoDb):
    cursorList     = mongoDb.logs.find()
    count               = 1
    for row in cursorList:
        logFile.write( "\n[" + str(count) + "]" + str(row))
        count = count + 1
    return logFile

def closeLogFile(logFile):
    logFile.write("\n-------------------------EOF------------------------")
    logFile.close()

def storeValuesMysql(USER_ID,FLOW_SENSOR,flow,startTime,endTime):
    print ("FLOW COUNT IS",flow)   
    mysqlTuple          = connectMysql()
    logFile             = openLogFile()
    mysqlCursor         = mysqlTuple[1]
    mysqlQuery          = "INSERT INTO `logs` VALUES ( %s, %s, %s, %s, %s, %s)"
    mysqlCursor.execute(mysqlQuery, (str(USER_ID),str(FLOW_SENSOR),str(flow),str(startTime),str(endTime),"false"))
    logFile             = writeSelectMysqlLogFile(logFile, mysqlCursor)
    closeLogFile(logFile)
    disconnectMysql(mysqlTuple)

def storeMongo():
    print("Syncing data with server")
    mysqlTuple          = connectMysql()
    mongoTuple          = connectMongo(IP_ADDRESS)
    logFileMysql        = openLogFile()
    logFileMongo        = openLogFile()
    mysqlCursor         = mysqlTuple[1]
    mongoDb             = mongoTuple[1]

    mysqlCursor.execute("SELECT * FROM logs WHERE onmongo='false'")
    resultList          = mysqlCursor.fetchall()

    for row in resultList:
        jsonData        = {'uid':str(row[0]), 'sid':str(row[1]),'sensorvalue':str(row[2]),'starttime':str(row[3]),'endtime':str(row[4])}
        mongoDb.logs.insert_one(jsonData)

    mysqlCursor.execute("UPDATE logs SET onmongo = 'true'")
    logFileMysql        = writeSelectMysqlLogFile(logFileMysql, mysqlCursor)
    logFileMongo        = writeSelectMongoLogFile(logFileMongo, mongoDb)

    closeLogFile(logFileMysql)
    closeLogFile(logFileMongo)
    disconnectMysql(mysqlTuple)
    disconnectMongo(mongoTuple)   

def syncUser():
    mysqlTuple          = connectMysql()
    mysqlCursor         = mysqlTuple[1]
    mongoTuple          = connectMongo(IP_ADDRESS)
    mongoDb             = mongoTuple[1]
    mongoCursor         = mongoDb.users.find({'onmysql':'false'})
    for document in mongoCursor:
        row_id        = document['_id']
        uid         = document['uid']
        hash        = document['hash']
        firstname   = document['firstname']
        lastname    = document['lastname'] 
        email       = document['email']
        phonenumber = document['phonenumber']
        societyname = document['societyname']
        flatnumber  = document['flatnumber']
        regionname  = document['regionname']
        onmysql     = document['onmysql']
        role        = document['role']
        mysqlQuery  = "INSERT INTO `users` VALUES ( %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"
        mysqlCursor.execute(mysqlQuery, (str(uid),str(hash),str(firstname),str(lastname),str(email),str(phonenumber),str(flatnumber),str(societyname),str(regionname),str(role),"true"))
        mongoDb.users.update({'_id':row_id},{'$set':{'onmysql':'true'}})
    
    disconnectMongo(mongoTuple) 
    disconnectMysql(mysqlTuple)

#------classes---
class DummyValueClass:
    def __init__(self):
        self.FLOW_SENSOR = 19
        self.flow = str('%.3f'%(random.random()))
        self.startTime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        time.sleep(random.randint(1,7))
        self.endTime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
