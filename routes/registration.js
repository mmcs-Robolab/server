var router = require('express').Router();
var passwordLib = require('../lib/password');
var checkAuth = require('../lib/checkAuth');

var modelUser = require('model/user');

//router.get('/', function(req, res, next) {
//    'use strict';
//
//    if (checkAuth(req, res, next)) {
//        res.redirect('/'); // index
//    } else {
//        res.render('registration', {title: 'Регистрация'});
//    }
//});

router.post('/', function(req, res, next) {
    'use strict';

    modelUser.create({
        login: req.body.login,
        pass: passwordLib.hash(req.body.pass),
        name: req.body.name + ' ' + req.body.secondName,
        email: req.body.email
    }, function(err, rows, fields) {
        // todo: error message
        var error = (!err && rows[0].id <= 0)? new Error('bad data'): err;
        if (error) {
            return next(error);
        }

        res.send(200);
    });
});

module.exports = router;
