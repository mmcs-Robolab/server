var router = require('express').Router();
var passwordLib = require('../lib/password');
var checkAuth = require('../lib/checkAuth');
var modelUser = require('../model/user');

router.get('/', function(req, res, next) {
    'use strict';

    res.render('registration', {title: 'Регистрация'});
    //if (checkAuth(req, res, next)) {
    //    res.redirect('/'); // index
    //} else {
    //    res.render('registration', {title: 'Регистрация'});
    //}
});

/**
 * @api {post} /registration Registrate
 * @apiName Registrate
 * @apiGroup Registration
 *
 * @apiParam {String} login
 * @apiParam {String} pass
 * @apiParam {String} name
 * @apiParam {String} email
 */
router.post('/', function(req, res, next) {
    'use strict';

    console.log('registration');

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
