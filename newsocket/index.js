var io = require('socket.io'),
    redis = require('socket.io-redis'),
    extend = require('extend'),
    async = require('async'),
    request = require('request'),
    cookieParser = require('cookie-parser'),
    cookie = require('cookie'),
    config = require('../config'),
    utils = require('../modules/utils'),
    dbProcess = require('../models/process').Process,
    validateProxies = require('../socket/processes/validateProxies'),
    Process = require('./process');

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

    function sendProcessEvent(process) {
        s.sockets.in(process.username + ':' + process.accountId + ':' + process.processId).emit('printEvent', process);
        s.sockets.in(process.username + ':' + process.accountId + ':' + 'defaultProcess').emit('printEvent', process);
    }

    function sendProcessState(data) {
        s.sockets.in(data.username + ':' + data.accountId + ':' + data.processId).emit('setState', data/*{state: data.state, msg: data.msg}*/);
        s.sockets.in(data.username + ':' + data.accountId + ':' + 'tasksListen').emit('setState', data/*{state: data.state, msg:  data.msg}*/);
    }

    function startProcess(data) {
        var newProcess = new Process(data);
        processes.push(newProcess);
        newProcess.start();
        process.send({
            command: 'startProcess',
            data: data
        });
        sendProcessState(newProcess);
    }

    function startPauseProcess(data, bSend) {
        var process = getProcess(data);
        if (process) {
            if (bSend) {
                sendProcessState(extend({}, data, {state: process.state}));
            } else {
                var curState = process.getState();
                if (curState === 1) {
                    process.pause();
                } else {
                    process.start();
                }
            }
        }
    }

    function stopProcess(data, bSend) {
        var curProc = getProcess(data);
        if (curProc) {
            if (bSend) {
                if (curProc.getState() !== 0) {
                    curProc.stop();
                    process.send({
                        command: 'justStopProcess',
                        data: data
                    });
                }
                curProc.save(function(err){
                    if(err) {
                        console.error(err);
                    } else {
                        sendProcessState(extend({}, data, {state: curProc.state}));
                        console.log('process stopped');
                        processes.splice(processes.indexOf(curProc), 1);
                        console.log(processes);
                    }
                });
            } else {
                curProc.stop();
            }
        }
    }

    function getAllProcesses(data) {
        var result = [];

        for (var k = 0; k < processes.length; k++) {
            if (processes[k].username === data.username) {
                result.push(processes[k]);
                break;
            }
        }

        return result;
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

    function setProcessMessage(data) {
        var process = getProcess(data);
        if (process) {
            process.messages.push(data.msg);
        }
    }

    process.on('message', function (msg, callback) {


        if (msg.data && msg.data.username) {


            var credentials = {
                username: msg.data.username,
                accountId: msg.data.accountId,
                processId: msg.data.processId
            };

            var room = getUserNameString(credentials);

            switch (msg.command) {
                case  'startProcess':

                    var currentProcess = getProcess(msg.data);

                    console.log('startProcess');

                    if (!currentProcess) {

                        var settings = msg.data.settings;
                        var title = msg.data.title;

                        switch (credentials.processId) {
                            case 'validateProxies':
                                break;
                            case 'validateProxies':
                                break;
                            case 'validateProxies':
                                break;
                            case 'validateProxies':
                                break;
                            case 'validateProxies':
                                break;
                            default:
                                console.log('ХЗ процесс');
                                return (0);
                        }

                        eval(credentials.processId)(processes, credentials, settings, (err, cbData) => {

                            if (cbData.hasOwnProperty('msg')) {
                                setProcessMessage(extend({}, credentials, {msg: cbData.msg}));
                            }

                            switch (cbData.cbType) {
                                case 0:
                                    stopProcess(extend({}, credentials, cbData), true);
                                    return (0);
                                    break;
                                case 1: //process message
                                    sendProcessEvent(extend({}, credentials, cbData));
                                    break;
                                case 2: //start process
                                    startProcess(extend({}, credentials, {
                                        settings: settings,
                                        title: title
                                    }));
                                    break;
                                case 3: //startPauseProcess
                                    startPauseProcess(extend({}, credentials, cbData), true);
                                    break;
                                case 4: //row event
                                    s.sockets.in(room).emit('refreshRow', extend({}, credentials, cbData));
                                    break;
                            }
                        });
                    }
                    break;
                case 'startPauseProcess':
                    startPauseProcess(extend({}, msg.data), false);
                    break;
                case 'stopProcess':
                    stopProcess(extend({}, msg.data), false);
                    break;
                case 'getCurrentProcess':

                    var process = getProcess(msg.data);
                    if (!process) {
                        dbProcess.findOne(credentials).sort({created: -1}).exec(function(err, doc){
                            if(err) {
                                console.error(err);
                            } else {
                                s.sockets.in(room).emit('setProcess', doc);
                            }
                        })
                    } else {
                        s.sockets.in(room).emit('setProcess', process);
                    }

                    break;
                default:
                    console.log('default ' + msg.command);
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

        socket.join(user.username);

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

                switch (command) {
                    case 'join':
                        user.processId = data.processId;
                        socket.join(getUserNameString(user));
                        return;
                    case 'switchAccount':
                        for (var k in user.roomsWhereUserIs) {
                            if (k.indexOf(user.accountId) > -1)
                                this.leave(k);
                        }
                        user.accountId = data.accountId;
                        this.join(user.username + ':' + user.accountId);
                        this.emit('switchAccount');
                        return;
                }

                switch (command) {
                    case 'getCurrentProcess':
                    case 'startPauseProcess':
                    case 'stopProcess':
                        process.send({
                            command: command,
                            data: extend({}, user, {
                                processId: data.processId,
                                settings: data.settings,
                                title: data.title
                            })
                        });
                        return;
                }

                switch (command) {
                    default:
                        onevent.call(this, packet);
                }


            } else {
                console.error(process.pid + ': [' + getUserNameString(user) + '] validation error [' + command + ']');
                this.emit('clientError', {
                    notify: 'Команда сокета не прошла проверку',
                    type: 4
                });
            }
        };


        socket.on('disconnect', function (inData) {
            console.log(process.pid + ': [' + getUserNameString(user) + '] disconnected');
        });


        socket.on('getAllProcesses', function (inData) {
            process.send({
                command: 'getAllProcesses',
                data: extend({}, user)
            });
        });
    })
};

module.exports = sio;
