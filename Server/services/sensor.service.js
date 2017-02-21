var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var sensor_db = mongo.db(config.connectionString, { native_parser: true });
sensor_db.bind('logs');
var service = {};

service.getSensorById   = getSensorById;
service.getSensorAll    = getSensorAll;

module.exports = service;

function getSensorById(uid) {
    var deferred = Q.defer();

    sensor_db.logs.find({'uid':uid}).sort({"starttime":-1}).toArray(function (err, sensor) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        else {
            // return sensor data
            deferred.resolve(sensor);      
        }
    });
    return deferred.promise;
}

function getSensorAll() {
    var deferred = Q.defer();

    sensor_db.logs.find({}).sort({"starttime":-1}).toArray(function (err, sensor) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        else {
            // return sensor data
            deferred.resolve(sensor);      
        }
    });
    return deferred.promise;
}



























