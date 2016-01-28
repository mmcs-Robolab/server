var router = require('express').Router();
var passwordLib = require('../lib/password');
var modelUser = require('../model/user');
var checkAuth = require('../lib/checkAuth');

function fillSessionInfo(session, data) {
    'use strict';

    session.userId = data.id;
    session.username = data.name;
    session.email = data.email;
    session.login = data.login;
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
 * @api {get} /auth/userInfo User info
 * @apiName UserInfo
 * @apiGroup Auth
 *
 */

router.get('/userInfo', function(req, res, next) {

    if (checkAuth(req, res, next)) {
        var resData = {};
        if(req.session.userId != undefined)
        {
            resData = {
                userId: req.session.userId,
                username: req.session.username,
                email: req.session.email,
                login: req.session.login
            }
        }
        res.send(resData);
    } else {
        res.send(418);
    }


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