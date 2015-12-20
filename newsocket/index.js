var io = require('socket.io');
var redis = require('socket.io-redis');
var extend = require('extend');
var async = require('async');
var request = require('request');
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
var config = require('../config');
var utils = require('../modules/utils');


const COMMANDS_DATA = [
    {
        command: 'join',
        fields: [
            {
                processId: {
                    properties: []
                }
            }
        ]
    },
    {
        command: 'leaveAll',
        fields: [
            {}
        ]
    },
    {
        command: 'leave',
        fields: [
            {}
        ]
    },
    {
        command: 'getCurrentProcess',
        fields: [
            {}
        ]
    },
    {
        command: 'startPauseProcess',
        fields: [
            {
                processId: {
                    properties: []
                }
            }
        ]
    },
    {
        command: 'getAllProcesses',
        fields: [
            {}
        ]
    },
    {
        command: 'stopProcess',
        fields: [
            {
                processId: {
                    properties: []
                }
            }
        ]
    },
    {
        command: 'switchAccount',
        fields: [
            {
                accountId: {
                    properties: []
                }
            }
        ]
    }
];


var sio = function (server) {

    var s = io.listen(server);

    s.adapter(redis({
        host: 'localhost',
        port: 6379
    }));

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

    function startPauseProcess(data) {
        var process = getProcess(data);
        if (process) {
            process.state = data.state;
            s.sockets.in(process.username + ':' + process.accountId + ':' + process.processId).emit('setState', process);
            s.sockets.in(process.username + ':' + process.accountId + ':' + 'tasksListen').emit('setState', process);
        }
    }

    function stopProcess(data) {
        var process = getProcess(data);
        if (process) {
            process.state = data.state;
            s.sockets.in(process.username + ':' + process.accountId + ':' + process.processId).emit('setState', process);
            s.sockets.in(process.username + ':' + process.accountId + ':' + 'tasksListen').emit('setState', process);
        }
    }

    function validatePacketData(command, data) {


        for (var i = 0; i < COMMANDS_DATA.length; i++) {


            if (COMMANDS_DATA[i].command === command) {
                //console.log('v:'+command);
                for (var k = 0; k < COMMANDS_DATA[i].fields.length; k++) {
                    //  console.log('v:'+COMMANDS_DATA[i].fields);

                    for (var t in COMMANDS_DATA[i].fields[k]) {
                        if (data.hasOwnProperty(t)) {
                            //console.log('v:'+t);
                        } else {
                            console.log(t);
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    function getUserNameString(user) {
        return user.username + ':' + (user.accountId ? user.accountId + (user.processId ? ':' + user.processId : '') : '');
    }

    process.on('message', function (msg) {


        if (msg.data && msg.data.username) {


            var credentials = {
                username: msg.data.username,
                accountId: msg.data.accountId,
                processId: msg.data.processId
            };

            var room = getUserNameString(credentials);


            console.log(process.pid + ': message [' + msg.command + '] from [' + room + ']');

            switch (msg.command) {
                case  'startProcess':
                    var proc = getProcess(msg.data);
                    if (!proc) {
                        var delay = function (data) {
                            var proces = getProcess(data);
                            if (proces) {

                                if (proces.state !== 0) {
                                    var msg = utils.createMsg({
                                        msg: `Выполняется ${proces.processId + ' ' + proces.state }`,
                                        type: 0
                                    });

                                    s.sockets.in(proces.username + ':' + proces.accountId + ':' + proces.processId).emit('updatechat', extend({}, data, {msg: msg}));
                                    s.sockets.in(proces.username + ':' + proces.accountId + ':' + 'defaultProcess').emit('updatechat', extend({}, data, {msg: msg}));


                                    process.send({
                                        command: 'setProcessMessage',
                                        data: extend({}, data, {msg: msg})
                                    })

                                } else {
                                    console.log('process stopped');
                                    processes.splice(processes.indexOf(proces), 1);
                                    console.log(processes);
                                    return;
                                }

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
                case 'stopProcess':
                    stopProcess(msg.data);
                    break;
                case 'setProcess':
                    s.sockets.in(room).emit('setProcess', msg.data.process);
                    break;

                case 'setProcesses':
                    console.log('setProcesses');
                    console.log(room);
                    s.sockets.in(room).emit('setProcesses', msg.data.processes);
                    break;
                default:
                    s.to([msg.data.socketId]).emit(msg.command, msg.data);
            }
        } else {
            switch (msg.command) {
                case 'memoryUsage':
                    process.send({
                        command: 'setMemoryUsage',
                        data: {
                            processPid: process.pid,
                            memoryUsage: process.memoryUsage()
                        }
                    });
                    break;
                case 'sendMemoryUsage':
                    s.sockets.in('memoryUsage').emit('memoryUsage', msg.data);
                    break;
            }
        }
    });


    s.set('authorization', function (handshakeData, accept) {

        if (handshakeData.headers.cookie) {
            var parsedCookies = cookie.parse(handshakeData.headers.cookie);
            if (parsedCookies["username"]) {
                var username = cookieParser.signedCookie(parsedCookies["username"], config.get('secretCookies'));
                if (username !== parsedCookies["username"]) {
                    handshakeData.username = username;
                    return accept(null, true);
                }
            }
        }

        return accept('Вы не авторизованы', false);
    });

    s.sockets.on('connection', function (socket) {

        var user = {
            username: socket.request.username
        };

        var onevent = socket.onevent;

        socket.onevent = function (packet) {
            var args = packet.data || [];
            var command = args[0];
            var data = args[1];
            console.log(process.pid + ': [' + getUserNameString(user) + '] command [' + command + ']');
            if (validatePacketData(command, data)) {
                var roomsWhereUserIs = [];
                for (var k in s.sockets.adapter.rooms) {
                    if (k.indexOf(user.username) > -1)
                        roomsWhereUserIs.push(k);
                }
                user.roomsWhereUserIs = roomsWhereUserIs;
                onevent.call(this, packet);
            } else {
                console.error(process.pid + ': [' + getUserNameString(user) + '] validation error [' + command + ']');
                this.emit('clientError', {
                    notify: 'Команда сокета не прошла проверку',
                    type: 4
                });
            }
        };


        socket.join(user.username);

        socket.on('join', function (inData) {
            console.log('join to ', inData.processId)
            user.processId = inData.processId;
            socket.join(getUserNameString(user));
            //s.sockets.in(inData).emit('updatechat', 'you are in ' + user.username + ':' + user.accountId + ':' + inData);
        });

        socket.on('leaveAll', function (inData) {
            for (var i = 0; i < socket.rooms.length; i++) {
                socket.leave(socket.rooms[i]);
            }
        });

        socket.on('leave', function (inData) {
            for (var i = 0; i < socket.rooms.length; i++) {
                if (socket.rooms[i] === inData) {
                    socket.leave(socket.rooms[i]);
                    break;
                }
            }
        });

        socket.on('disconnect', function (inData) {
            console.log(process.pid + ': [' + getUserNameString(user) + '] disconnected');
        });

        socket.on('getCurrentProcess', function (inData) {
            process.send({
                command: 'getCurrentProcess',
                data: extend({}, user, {
                    processId: inData.processId
                })
            });
        });

        socket.on('startPauseProcess', function (inData) {
            process.send({
                command: 'startPauseProcess',
                data: extend({}, user, {
                    processId: inData.processId,
                    settings: inData.settings,
                    title: inData.title
                })
            });
        });

        socket.on('getAllProcesses', function (inData) {
            process.send({
                command: 'getAllProcesses',
                data: extend({}, user, {
                    s: s.sockets.adapter.rooms
                })
            });
        });

        socket.on('stopProcess', function (inData) {
            process.send({
                command: 'stopProcess',
                data: extend({}, user, {
                    processId: inData.processId
                })
            });
        });

        socket.on('switchAccount', function (inData) {

            if (inData.accountId) {
                console.log(process.pid + ': [' + user.username + '] switchAccount');
                console.log(process.pid + ': [' + user.username + '] current accountId: [' + user.accountId + ']');


                console.log(process.pid + ': [' + user.username + '] current rooms:');
                var myRooms = [];
                for (var k in s.sockets.adapter.rooms) {
                    if (k.indexOf(user.username) > -1)
                        myRooms.push(k);
                }
                console.log(myRooms);
                /// console.log(process.pid + ': [' + user.username + '] current rooms:');
                for (var k in myRooms) {
                    if (k.indexOf(user.accountId) > -1)
                        this.leave(k);
                }

                user.accountId = inData.accountId;
                user.processId = inData.processId;

                this.join(user.username + ':' + user.accountId);

                console.log(process.pid + ': [' + user.username + '] new rooms:');
                myRooms = [];
                for (var k in s.sockets.adapter.rooms) {
                    if (k.indexOf(user.username) > -1)
                        myRooms.push(k);
                }
                console.log(myRooms);

                this.emit('switchAccount');

            }


        })

    })
};


module.exports = sio;
