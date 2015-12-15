var io = require('socket.io');
var redis = require('socket.io-redis');
var extend = require('extend');
var async = require('async');
var request = require('request');
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
var config = require('../config');
var utils = require('../modules/utils');


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
            console.log(process.username + ':' + process.accountId + ':' + process.processId)
            process.state = data.state;
            s.sockets.in(process.username + ':' + process.accountId + ':' + process.processId).emit('setState', process);
            s.sockets.in(process.username + ':' + process.accountId + ':' + 'tasksListen').emit('setState', process);
        }
    }

    process.on('message', function (msg) {

        var credentials = {
            username: msg.data.username,
            accountId: msg.data.accountId,
            processId: msg.data.processId
        };

        var room = credentials.username + ':' + credentials.accountId; //+ ':' + credentials.processId;

        console.log(process.pid + ': message [' + msg.command + '] from [' + room + ']');

        switch (msg.command) {
            case  'startProcess':
                var proc = getProcess(msg.data);
                if (!proc) {
                    var delay = function (data) {
                        var proces = getProcess(data);
                        if (proces) {
                            var msg = utils.createMsg({
                                msg: `Выполняется ${proces.processId + ' ' + proces.state }`,
                                type: 0
                            });
                            s.sockets.in(proces.username + ':' + proces.accountId + ':' + proces.processId).emit('updatechat', {
                                msg: msg
                            });
                            s.sockets.in(proces.username + ':' + proces.accountId + ':' + 'tasksListen').emit('updatechat', {
                                msg: msg
                            });

                            process.send({
                                command: 'setProcessMessage',
                                data: extend(data, {msg: msg})
                            })
                        }
                        d = setTimeout(function () {
                            delay(data);
                        }, 1000);
                    };
                    delay(msg.data);
                    processes.push(msg.data);
                    s.sockets.in(msg.data.username + ':' + msg.data.accountId).emit('setState', msg.data);
                }
                break;
            case 'setProcessState':
                startPauseProcess(msg.data);
                break;
            case 'setProcess':
                s.sockets.in(room).emit('setProcess', msg.data.process);
                break;
            case 'setProcesses':
                console.log('setProcesses');
                s.sockets.in(room).emit('setProcesses', msg.data.processes);
                break;
            default:
                s.to([msg.data.socketId]).emit(msg.command, msg.data);
        }
    });


    s.set('authorization', function (handshakeData, accept) {

        if (handshakeData.headers.cookie) {
            var parsedCookies = cookie.parse(handshakeData.headers.cookie);
            if (parsedCookies["username"]) {
                var username = cookieParser.signedCookie(parsedCookies["username"], config.get('secretCookies'));
                if (username !== parsedCookies["username"]) {
                    handshakeData.username = username;
                    handshakeData.accountId = handshakeData._query.accountId;
                    return accept(null, true);
                }
            }
        }

        return accept('Вы не авторизованы', false);
    });

    s.sockets.on('connection', function (socket) {

        var user = {
            username: socket.request.username,
            accountId: socket.request.accountId
        };

        console.log(process.pid + ': [' + user.username + ':' + user.accountId + '] user connected');

        socket.join(user.username);
        socket.join(user.username + ':' + user.accountId);

        socket.on('stopProcess', function (inData) {
            console.log(inData);
        });

        socket.on('join', function (inData) {
            console.log(process.pid + ': [' + user.username + ':' + user.accountId + '] join to ' + inData);
            socket.join(user.username + ':' + user.accountId + ':' + inData);
            s.sockets.in(inData).emit('updatechat', 'you are in ' + user.username + ':' + user.accountId + ':' + inData);
        });

        socket.on('leaveAll', function (inData) {
            console.log(process.pid + ': [' + user.username + ':' + user.accountId + '] leave all rooms');
            for (var i = 0; i < socket.rooms.length; i++) {
                socket.leave(socket.rooms[i]);
            }
        });

        socket.on('leave', function (inData) {
            console.log(process.pid + ': [' + user.username + ':' + user.accountId + '] leave room ' + inData);
            for (var i = 0; i < socket.rooms.length; i++) {
                if (socket.rooms[i] === inData) {
                    socket.leave(socket.rooms[i]);
                    break;
                }
            }
        });

        socket.on('disconnect', function (inData) {
            console.log(process.pid + ': [' + user.username + ':' + user.accountId + '] disconnected');
        });

        socket.on('getCurrentProcess', function (inData) {
            process.send({
                command: 'getCurrentProcess',
                data: {
                    username: user.username,
                    accountId: inData.accountId,
                    processId: inData.processId
                }
            });
        });

        socket.on('startPauseProcess', function (inData) {
            console.log(inData);
            process.send({
                command: 'startPauseProcess',
                data: extend({
                    username: user.username,
                    accountId: inData.accountId, //TODO
                    processId: inData.processId

                }, {settings: inData.settings, title: inData.title})
            });
        });

        socket.on('getAllProcesses', function (inData) {
            //  console.log(inData);
            process.send({
                command: 'getAllProcesses',
                data: {
                    username: user.username,
                    accountId: user.accountId
                }

            });
        })

    })
};


module.exports = sio;
