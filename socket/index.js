"use strict"

var io = require('socket.io');

var User = require('./user');
var Process = require('./process');


var sio = function (http) {

    var s = io.listen(http);

    this.users = [];

    var that = this;

    s.sockets.on('connection', function (socket) {

        //  var username = 'huyax';//socket.request.username;

        var user = that.addUser({
            username: 'huyax',
            socket: socket
        });

        if (user) {
            console.log(that.users[0].processes);

            socket.on('disconnect', function () {
                console.log(' disconnected');
            });

            socket.on('startPauseProcess', function (options) {
                that.startPauseProcess(user, options);
            });

            socket.on('stopProcess', function (options) {
                that.stopProcess(user, options);
            });

            socket.on('getCurrentProcess', function (options) {
                var process = that.getCurrentProcess(user, options);

                socket.emit('setProcess', process ? {
                    state: process.state,
                    settings: process.settings,
                    messages: process.messages
                } : process);
            });
        }


    });


    /*setInterval(function () {
     console.log('time');
     s.sockets.emit('time', Date());
     }, 5000);*/

};

sio.prototype.addUser = function (user) {
    var findedUser = this.findUserByName(user.username);
    if (findedUser) {
        findedUser.socket = user.socket;
    } else {
        findedUser = new User(user);
        this.users.push(findedUser);
    }
    return findedUser;
};

sio.prototype.findUserByName = function (username) {
    var user = null;
    for (var i = 0; i < this.users.length; i++) {
        if (this.users[i].username === username) {
            user = this.users[i];
            break;
        }
    }
    return user;
};

sio.prototype.getCurrentProcess = function (user, options) {
    var process = null;
    for (var i = 0; i < user.processes.length; i++) {
        if (user.processes[i].pageId === options.pageId) {
            process = user.processes[i];
            break;
        }
    }
    return process;
};

sio.prototype.startPauseProcess = function (user, options) {
    var process = this.getCurrentProcess(user, options);
    if (process) {
        process.start();
    } else {
        var newProcess = new Process(user, options);
        user.processes.push(newProcess);
        newProcess.start();
    }
};

sio.prototype.stopProcess = function (user, options) {
    var process = this.getCurrentProcess(user, options);
    if (process) {
        process.stop();
    }
};

module.exports.sio = sio;
