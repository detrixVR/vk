"use strict";

var io = require('socket.io');

var User = require('./user');
var Process = require('./process');
var async = require('async');


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
                async.waterfall([function (callback) {
                    return callback(null, that.getCurrentProcess(user, options));
                }, function (process, callback) {
                    if (!process) {
                        user.getArchivedProcess(options, function (err, process) {
                            return callback(err ? err : null, process);
                        })
                    } else {
                        return callback(null, process);
                    }
                }], function (err, process ) {
                    if (err) {

                    }
                    socket.emit('setProcess', process ? (process.options ? process.options : process) : null);
                });
            });
        }
    });
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
        if (user.processes[i].options.pageId === options.pageId) {
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
        console.log('here');
        process.stop();
    }
};

module.exports.sio = sio;
