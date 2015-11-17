var app = require('../app');

module.exports = function(server) {
    var io = require('socket.io').listen(server);

    var count = 0;
    io.sockets.on('connection', function (socket) {
        console.log('connection :' + count + '; connected: ' + socket.id);
        ++count;
    });

    io.sockets.on('disconnect', function () {
       console.log('disconnected');
    });


    io.sockets.on('message', function(text) {
        console.log(123);
    });

    io.sockets.on('error', function(err) {
        console.log(err);
    });

    return io;
}