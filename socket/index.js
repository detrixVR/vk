"use strict"

var io = require('socket.io');

var User = require('./user');





var sio = function (http) {

    var s = io.listen(http);

    this.users = [];

    var that = this;

    s.sockets.on('connection', function (socket) {

      //  var username = 'huyax';//socket.request.username;

        that.addUser({
            username: 'huyax',
            socket: socket
        });

        console.log(that.users);

        socket.on('disconnect', function(){
            console.log(' disconnected');
        });

        socket.on('setProcess', function(process){
            that.setProcess('huyax', process);
        });
    });


    /*setInterval(function () {
        console.log('time');
        s.sockets.emit('time', Date());
    }, 5000);*/

};

sio.prototype.addUser = function(user) {
    var findedUser = this.findUserByName(user.username);
    if (findedUser) {
        findedUser.socket = user.socket;
    } else {
        this.users.push(new User(user));
    }
};

sio.prototype.findUserByName = function(username) {
    var user = null;
    for (var i = 0; i < this.users.length; i++) {
        if (this.users[i].username === username) {
            user = this.users[i];
            break;
        }
    }
    return user;
};

sio.prototype.setProcess = function(username, process) {

    var user = this.findUserByName(username);

    if (user) {
        user.setProcess(process)
    }
};

module.exports.sio = sio;
