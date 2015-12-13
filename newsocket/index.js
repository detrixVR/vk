var io = require('socket.io');
var redis = require('socket.io-redis');
var extend = require('extend');
var async = require('async');
var request = require('request');


var sio = function (server) {

    var s = io.listen(server);

    s.adapter(redis({host: 'localhost', port: 6379}));

    var processes = [];

    function getProcess(data) {
        var process = null;
        for (var i = 0; i < processes.length; i++) {
            if (processes[i].username == data.username &&
                processes[i].accountId == data.accountId &&
                processes[i].processId == data.processId) {

                process = processes[i];

            }
        }
        return process;
    }

    function getProcessState(data) {
        var process = getProcess(data);
        var state = -1;
        if (process) {
            state = process.state;
        }
        return state;
    }

    function startPauseProcess(data) {
        var process = getProcess(data);
        if (process) {
            process.state = data.state;
        }
    }

    process.on('message', function (msg) {

        switch (msg.command) {
            case  'startProcess':
                var proc = getProcess(msg.data);
                if (!proc) {
                    var delay = function (data) {
                        var process = getProcess(data);
                        if (process) {
                            s.sockets.in(process.username + ':' + process.accountId).emit('updatechat', process);
                        }
                        console.log(process);
                        d = setTimeout(function () {
                            delay(data);
                        }, 1000);
                    };
                    delay(msg.data);
                    processes.push(msg.data);
                }
                break;
            case 'setProcessState':
                startPauseProcess(msg.data);
                break;
            default:
                s.to([msg.data.socketId]).emit(msg.command, msg.data);
        }
    });


    s.sockets.on('connection', function (socket) {

        console.log('connection to ' + process.pid);

        var user = {};

        socket.emit('welcome');

        socket.on('getAllUsers', function (inData) {
            process.send({
                command: 'getAllUsers',
                data: extend(data, inData)
            });
        });

        socket.on('username', function (inData) {
            user = extend(user, inData);
            socket.emit('username');
        });

        socket.on('startProcess', function (inData) {
            console.log(inData);
            process.send({
                command: 'startProcess',
                data: {
                    username: user.username,
                    accountId: inData.accountId,
                    processId: inData.processId
                }
            });
        });

        socket.on('pauseProcess', function (inData) {
            console.log(inData);
            process.send({
                command: 'pauseProcess',
                data: {
                    username: user.username,
                    accountId: inData.accountId,
                    processId: inData.processId
                }
            });
        });

        socket.on('stopProcess', function (inData) {
            console.log(inData);
        });

        socket.on('join', function (inData) {
            console.log('join to ' + inData);
            socket.join(inData);
            s.sockets.in(inData).emit('updatechat', 'you are in');
        });

        socket.on('leaveAll', function (inData) {
            console.log('leaveAll');
            for (var i = 0; i < socket.rooms.length; i++) {
                socket.leave(socket.rooms[i]);
            }
        });

        socket.on('leave', function (inData) {
            console.log('leave '+ inData);
            for (var i = 0; i < socket.rooms.length; i++) {
                if (socket.rooms[i] === inData) {
                    socket.leave(socket.rooms[i]);
                    break;
                }
            }
        });

        socket.on('disconnect', function (inData) {
            console.log('disconnected');
        });

    })
};


module.exports = sio;
