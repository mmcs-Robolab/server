var router = require('express').Router();
var passwordLib = require('../lib/password');
var modelUser = require('../model/user');

function fillSessionInfo(session, data) {
    'use strict';

    session.userId = data.id;
    session.username = data.name;

    var fullDate = new Date();
    var day = fullDate.getDate();
    var month = fullDate.getMonth() + 1;
    var year = fullDate.getFullYear();

    if(Math.floor(day / 10) == 0)
        day = '0' + fullDate.getDate();

    if(Math.floor(month / 10) == 0)
        month = '0' + (fullDate.getMonth() + 1);

    session.day = day;
    session.month = month;
    session.year = year;
}

/**
 * @api {post} /auth/ Log In
 * @apiName Login
 * @apiGroup Auth
 *
 * @apiParam {String} login
 * @apiParam {String} pass
 */

router.post('/', function(req, res, next) {
    'use strict';
    var login = req.body.login;
    var password = req.body.pass;

    modelUser.find(login, function(err, rows) {
        if (err) {
            return next(err);
        }
        var user = rows[0];

        if (user.length <= 0) {
            res.send(404);
        } else if (passwordLib.validate(user[0].pass, password)) {
            fillSessionInfo(req.session, user[0]);
            res.send(200);
        } else {
            res.send(403);
        }
    });
});

/**
 * @api {post} /auth/logout Log Out
 * @apiName Logout
 * @apiGroup Auth
 */

router.post('/logout', function(req, res, next) {
    'use strict';
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;