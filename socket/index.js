var io = require('socket.io');

var sio = function (http) {

    var s = io.listen(http);


    s.sockets.on('connection', function (socket) {

        var username = socket.request.username;


    });

    setInterval(function () {
        console.log('time');
        s.sockets.emit('time', Date());
    }, 5000);

};

module.exports.sio = sio;
