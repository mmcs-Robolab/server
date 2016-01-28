var router = require('express').Router();
var passwordLib = require('../lib/password');
var checkAuth = require('../lib/checkAuth');
var modelUser = require('../model/user');
var nodemailer = require('nodemailer');
var config = require('../config');

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

        var smtpConfig = config.get('smtp');
        var transporter = nodemailer.createTransport(smtpConfig);

        var mailOptions = {
            from: 'Robolab <piimka94@gmail.com>',
            to: req.body.email,
            subject: 'Регистрация в сервисе ROBOLAB',
            text: 'Здравствуйте, ' + req.body.name + '! ' +
            'Благодарим вас за регистрацию в сервисе Robolab.' +
            'Login: ' + req.body.login +
            'Password: ' + req.body.pass,
            html: '<p>Здравствуйте, ' + req.body.name + '! ' +
            'Благодарим вас за регистрацию в сервисе Robolab.' + '<br>' +
            'Login: ' + req.body.login +  '<br>' +
            'Password: ' + req.body.pass + '</p>'
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });

        res.send(200);
    });
});

module.exports = router;
