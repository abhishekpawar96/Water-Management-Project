var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');

router.get('/', function (req, res) {
    res.render('register');
});

router.post('/', function (req, res) {
    // register using api to maintain clean separation between layers
    request.post({
        url: config.apiUrl + '/users/register',
        form: req.body,
        json: true
    }, function (error, response, body) {
        if (error) {
            return res.render('register', { error: 'An error occurred' });
        }

        if (response.statusCode !== 200) {
            return res.render('register', {
                error: response.body,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                mobilenumber: req.body.mobilenumber,
                email: req.body.email,
                flatnumber: req.body.flatnumber,
                societyname: req.body.societyname,
                regionname: req.body.regionname,
                role:req.role,
                onmysql:'false',
                uid:req.body.uid
            });
        }

        // return to login page with success message
        req.session.success = 'Registration successful';
        return res.redirect('/login');
    });
});

module.exports = router;