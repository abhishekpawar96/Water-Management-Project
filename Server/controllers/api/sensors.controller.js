var config = require('config.json');
var express = require('express');
var router = express.Router();
var sensorService = require('services/sensor.service');

// routes
router.get('/current', getCurrentSensor);
router.get('/all', getAllSensor);

module.exports = router;

function getCurrentSensor(req, res) {
    sensorService.getSensorById(req.user.uid)
        .then(function (sensor) {
            if (sensor) {
                res.send(sensor);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAllSensor(req, res) {
    sensorService.getSensorAll()
        .then(function (sensor) {
            if (sensor) {
                res.send(sensor);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
           res.status(400).send(err);
        });
}
































