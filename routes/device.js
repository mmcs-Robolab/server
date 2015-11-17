var router = require('express').Router();

router.post('/', function(req, res, next) {
    'use strict';

    console.log('registration');
    res.render('index');
});

/**
 * @api {post} /device/connectedRobots Connected robots
 * @apiName Connected robots
 * @apiGroup Robots
 *
 */

router.post('/connectedRobots', function(req, res, next) {
   'use strict';
    var socketio = req.app.get('sock');

    function connectionActions(socket) {
        socket.on('error', function(err) {
            console.log(err);
           socket.emit('reconnectCustom');
        });
        socket.emit('connectedRobotsCli');

        socket.on('connectedRobotsServ', function (text) {
            socketio.sockets.removeListener('connection', connectionActions);
            res.send(text);
        })
    }

    if(Object.keys(socketio.engine.clients).length) {
        socketio.sockets.on('connection', connectionActions);
        socketio.emit('reconnectCustom');
    } else {
        res.send('0');
    }
});


/**
 * @api {post} /device/goForward Go forward
 * @apiName Go forward
 * @apiGroup Robots
 *
 */

router.post('/goForward', function(req, res, next) {
    var socketio = req.app.get('sock');
    
    function connectionActions(socket) {
        socket.on('error', function(err) {
            console.log(err);
            socket.emit('reconnectCustom');
        });

        socket.emit('goForwardCli');

        socket.on('goForwardServ', function (text) {
            res.send(text);
            socketio.sockets.removeListener('connection', connectionActions);
        })
    }

    if(Object.keys(socketio.engine.clients).length) {
        socketio.sockets.on('connection', connectionActions);
        socketio.emit('reconnectCustom');
    } else {
        res.send('0');
    }
});

module.exports = router;