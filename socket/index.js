"use strict";

var io = require('socket.io');
var extend = require('extend');
var User = require('./user');
var Process = require('./process');
var async = require('async');
var redis  = require('socket.io-redis');

var sio = function (http) {

    var s = io.listen(http);

    s.adapter(redis({ host: 'localhost', port: 6379 }));

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
                }], function (err, process) {
                    if (err) {
                        that.sendNotification(socket, {
                            notify: 'Server Error',
                            type: 0
                        });
                    } else {
                        socket.emit('setProcess', process ? (process.options ? process.options : process) : null);
                    }
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
    for (var k = 0; k < user.accounts.length; k++) {
        for (var i = 0; i < user.accounts[k].processes.length; i++) {
            if (user.accounts[k].processes[i].options.processId === options.processId) {
                process = user.accounts[k].processes[i];
                break;
            }
        }
    }
    return process;
};

sio.prototype.getAccount = function (user, options) {
    var account = null;
    for (var k = 0; k < user.accounts.length; k++) {
        if (user.accounts[k].accountId === options.accountId) {
            account = user.accounts[k];
            break;
        }
    }
    return account;
};

sio.prototype.startPauseProcess = function (user, options) {

    console.log(options.accountId);
    console.log(options.processId);


    var process = this.getCurrentProcess(user, options);

    if (process) {
        process.start();
    } else {

        switch (options.processId) {
            case 'validateProxy':
            case 'validateProxy':
            case 'validateProxy':
            case 'validateProxy':
            case 'validateProxy':
            case 'validateProxy':
                break;
            default :
                console.error('Неизвестная функция');
                return (0);
        }


        var account = this.getAccount(user, options);

        if (!account) {
            account = {
                accountId: options.accountId,
                processes: []
            };
            user.accounts.push(account);
        }


        var newProcess = new Process(user, options);
        account.processes.push(newProcess);
        newProcess.start();
    }
};

sio.prototype.stopProcess = function (user, options) {
    var process = this.getCurrentProcess(user, options);
    if (process) {
        process.stop();
    }
};

sio.prototype.sendNotification = function (socket, info) {
    socket.emit('displayNotification', info);
};

module.exports.sio = sio;
