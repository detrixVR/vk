//var User = require('./user');
var io = require('socket.io');
var redis = require('socket.io-redis');

var async = require('async');
var request = require('request');

var sio = function (server) {

    var s = io.listen(server);

    s.adapter(redis({host: 'localhost', port: 6379}));


    var that = this;

    process.on('message', function (msg) {
        console.log('here');
        console.log(msg);
        s.to(msg.data.socket).emit('message', 'for your eyes only');
    });

    s.sockets.on('connection', function (socket) {
        var redisClient = socket.adapter.pubClient;


       // console.log(process.on);

        process.send({
            command: 'addUser',
            data: {
                username: 'huyax1',
                socket: socket.id
            }
        });


        process.send({
            command: 'getAllUsers',
            data: {
                socket: socket.id
            }
        });


        var delay = function () {
            console.log('delay');
                d = setTimeout(delay, 1000);

        };
        delay();



        that.addUser(redisClient, {
            username: 'huyax1',
            socket: socket
        }, function (err, user) {
            if (err) {
                console.log(err);
            } else if (user) {

                socket.on('getCurrentProcess', function (options) {
                    that.getCurrentProcess(redisClient, user, options, function (err, process) {
                        if (err) {
                            that.sendNotification(socket, {
                                notify: 'Server Error',
                                type: 0
                            });
                        } else {
                            socket.emit('setProcess', process);
                        }
                    });
                });

                socket.on('startPauseProcess', function (options) {
                    that.startPauseProcess(redisClient, user, options, function (err){
                        if (err) {
                            that.sendNotification(socket, {
                                notify: 'Server Error',
                                type: 0
                            });
                        }
                    });
                });

                socket.on('disconnect', function () {
                    console.log('user disconnected ' + process.pid);
                });

                socket.on('pong', function () {
                    //redisClient.lrange('users', 0, -1, function (err, users) {
                     //   console.log(users);
                 //   });
                   // console.log('user pong ' + process.pid);
                });

                setInterval(function () {
                    socket.emit('time', new Date());
                }, 1000);
            }
        });
    });
};

sio.prototype.getCurrentProcess = function (redisClient, user, options, callback) {
    this.findUserByName(redisClient, user.username, function (err, findedUser) {
        if (err) {
            return callback(err);
        } else {
            var process = null;
            for (var i = 0; i < findedUser.accounts.length; i++) {
                for (var k = 0; i < findedUser.accounts[i].processes.length; k++) {
                    if (findedUser.accounts[i].processes[k].processId == options.processId) {
                        process = findedUser.accounts[i].processes[k];
                        break;
                    }
                }
            }
            return callback(null, process);
        }
    });
};

sio.prototype.findUserByName = function (redisClient, username, callback) {
    redisClient.lrange('users', 0, -1, function (err, users) {
        if (err) {
            return callback(err);
        } else {
            var user = null;
            for (var i = 0; i < users.length; i++) {
                var curUser = JSON.parse(users[i]);
                if (curUser.username === username) {
                    user = curUser;
                    user.redisIndex = i;
                    break;
                }
            }
            return callback(null, user)
        }
    })
};

sio.prototype.addUser = function (redisClient, user, callback) {
    this.findUserByName(redisClient, user.username, function (err, findedUser) {
        if (err) {
            return callback(err);
        } else if (findedUser) {
            findedUser.socketId = user.socket.id;
            redisClient.lset('users', findedUser.redisIndex, JSON.stringify(findedUser), function (err) {
                return callback(err ? err : null, findedUser);
            })
        } else {
            var newUser = {
                username: user.username,
                socketId: user.socket.id,
                accounts: []
            };
            redisClient.lpush('users', JSON.stringify(newUser), function (err) {
                return callback(err ? err : null, newUser);
            })
        }
    });
};

sio.prototype.startPauseProcess = function (redisClient, user, options) {

    console.log(options.accountId);
    console.log(options.processId);


    this.getCurrentProcess(redisClient, user, options, (err, process) => {
        if (err) {
            return callback(err);
        } else if (process) {
            process.start();
        } else {

        }
    });

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

sio.prototype.sendNotification = function (socket, info) {
    socket.emit('displayNotification', info);
};

module.exports = sio;
