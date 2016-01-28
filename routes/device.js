var router = require('express').Router();
var fs = require('fs');
var checkAuth = require('../lib/checkAuth');


router.get('/', function(req, res, next) {
    'use strict';

    if (checkAuth(req, res, next)) {
        res.render('control', {title: "Управление", username: req.session.username, auth: true});
    } else {

        // TODO auth page
        res.redirect('/');
    }


});


/**
 * @api {post} /device/list Connected devices
 * @apiName Connected devices
 * @apiGroup Devices
 *
 */

router.get('/list', function(req, res, next) {
    var obj = JSON.parse(fs.readFileSync('./devices/devices.json', 'utf8'));
    res.send(obj);
});


/**
 * @api {post} /device/setDeviceState Set state
 * @apiName Set state
 * @apiGroup Devices
 *
 * @apiParam {String} deviceID
 * @apiParam {String} newState
 */

router.post('/setDeviceState', function(req, res, next) {
    var id = parseInt(req.body.id);
    var state = parseInt(req.body.state);

    fs.readFile('./devices/devices.json', 'utf8', function(err, content) {
        var obj = JSON.parse(content);

        obj["devices"][id].state = state;
        fs.writeFile("./devices/devices.json", JSON.stringify(obj), function (err) {
            if(!err) {
                res.send(200);
            } else res.send(500);

        });
    });

});



/**
 * @api {post} /device/connectedRobots Connected robots
 * @apiName Connected robots
 * @apiGroup Robots
 *
 */

router.get('/connectedRobots', function(req, res, next) {
   'use strict';

    var obj = JSON.parse(fs.readFileSync('./devices/robots.json', 'utf8'));
    res.send(obj);

    //var socketio = req.app.get('sock');
    //
    //function connectionActions(socket) {
    //    socket.on('error', function(err) {
    //        console.log(err);
    //       socket.emit('reconnectCustom');
    //    });
    //    socket.emit('connectedRobotsCli');
    //
    //    socket.on('connectedRobotsServ', function (text) {
    //        socketio.sockets.removeListener('connection', connectionActions);
    //        res.send(text);
    //    })
    //}
    //
    //if(Object.keys(socketio.engine.clients).length) {
    //    socketio.sockets.on('connection', connectionActions);
    //    socketio.emit('reconnectCustom');
    //} else {
    //    res.send('0');
    //}
});



router.post('/setX', function(req, res, next) {

    var id = parseInt(req.body.id);
    var x = parseInt(req.body.state);

    fs.readFile('./devices/robots.json', 'utf8', function(err, content) {
        var obj = JSON.parse(content);

        obj["robots"][id].x = x;
        fs.writeFile("./devices/robots.json", JSON.stringify(obj), function (err) {
            if(!err) {
                res.send(200);
            } else res.send(500);

        });
    });
});

router.post('/setY', function(req, res, next) {

    var id = parseInt(req.body.id);
    var y = parseInt(req.body.state);

    fs.readFile('./devices/robots.json', 'utf8', function(err, content) {
        var obj = JSON.parse(content);

        obj["robots"][id].y = y;
        fs.writeFile("./devices/robots.json", JSON.stringify(obj), function (err) {
            if(!err) {
                res.send(200);
            } else res.send(500);

        });
    });
});

module.exports = router;