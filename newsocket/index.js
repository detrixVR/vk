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
    searchPeoples = require('../socket/processes/searchPeoples'),
    searchGroups = require('../socket/processes/searchGroups'),
    configurationClean = require('../socket/processes/configurationClean'),

    listCreatingFromPerson = require('../socket/processes/listCreating/listCreatingFromPerson'),
    _ = require('underscore'),
    Process = require('./process'),
    Task = require('./task');


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

    var self = this;
    this.s = io.listen(server);

    self.s.adapter(redis({
        host: 'localhost',
        port: 6379
    }));

    var processes = [];
    var tasks = [];

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
        self.s.sockets.in(process.username + ':' + process.accountId + ':' + process.processId).emit('printEvent', process);
        self.s.sockets.in(process.username + ':' + process.accountId + ':' + 'defaultProcess').emit('printEvent', process);
    }

    function sendProcessState(data) {
        self.s.sockets.in(data.username + ':' + data.accountId + ':' + data.processId).emit('setState', /*data*/{
            state: data.state,
            msg: data.msg
        });
        self.s.sockets.in(data.username + ':' + data.accountId + ':' + 'tasksListen').emit('setState', /*data*/{
            state: data.state,
            msg: data.msg
        });
    }

    function startProcess(data) {
        var newProcess = new Process(data);
        processes.push(newProcess);
        newProcess.start();
        process.send({
            command: 'startProcess',
            data: data
        });
        sendProcessState(extend({}, newProcess, data));
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

                }
                curProc.save(function (err) {
                    if (err) {
                        console.error(err);
                    } else {
                        process.send({
                            command: 'justStopProcess',
                            data: data
                        });
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

    function getAllTasks(data) {
        var result = [];

        for (var k = 0; k < tasks.length; k++) {
            if (tasks[k].username === data.username &&
                tasks[k].accountId === data.accountId) {

                result.push({
                    username: tasks[k].username,
                    accountId: tasks[k].accountId,
                    settings: tasks[k].settings,
                    uid: tasks[k].uid,
                    messages: tasks[k].messages,
                    state: tasks[k].state
                });
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

    function setProcessMessage(data) {
        var process = getProcess(data);
        if (process) {
            process.messages.push(data.msg);
        }
    }

    function getExistingTask(data) {
        var task = null;

        for (var k = 0; k < tasks.length; k++) {
            if (tasks[k].username === data.username &&
                tasks[k].accountId === data.accountId &&
                (tasks[k].uid === data.uid || tasks[k].uid === data.taskName)) {
                task = tasks[k];
                break;
            }
        }

        return task;
    }

    process.on('message', function (msg) {

        var task = null;

        if (msg.data && msg.data.username) {


            var credentials = {
                username: msg.data.username,
                accountId: msg.data.accountId,
                processId: msg.data.processId
            };

            var room = self.getUserNameString(credentials);

            switch (msg.command) {
                case  'startProcess':

                    var currentProcess = getProcess(msg.data);

                    console.log('startProcess');

                    if (!currentProcess) {

                        var settings = msg.data.settings;
                        var title = msg.data.title;

                        switch (credentials.processId) {
                            case 'validateProxies':
                            case 'searchPeoples':
                            case 'searchGroups':
                            case 'configurationClean':
                            case 'listCreatingFromPerson':
                            case 'listCreatingFromGroup':
                            case 'listCreatingFromAudio':
                            case 'listCreatingFromVideo':
                            case 'listCreatingFromPost':
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
                                    }, cbData));
                                    break;
                                case 3: //startPauseProcess
                                    startPauseProcess(extend({}, credentials, cbData), true);
                                    break;
                                case 4: //row event
                                    self.s.sockets.in(room).emit('refreshRow', extend({}, credentials, cbData));
                                    break;
                                case 5: //row event
                                    self.s.sockets.in(room).emit('reloadGrid', extend({}, credentials, cbData));
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

                    var proc = getProcess(msg.data);
                    if (!proc) {
                        dbProcess.findOne(credentials).sort({created: -1}).exec((err, doc) => {
                            if (err) {
                                console.error(err);
                            } else {
                                self.s.sockets.in(room).emit('setProcess', doc);
                            }
                        })
                    } else {
                        self.s.sockets.in(room).emit('setProcess', proc);
                    }

                    break;
                case 'createTask':
                    /*var newTask = new Task(self, msg.data);
                     tasks.push(newTask);
                     console.log('tasks length: ', tasks.length);
                     self.s.sockets.in(room).emit(msg.command, extend({}, msg.data, {
                     state: newTask.state,
                     messages: newTask.messages
                     }));*/
                    console.error('here11111111');
                    break;
                case 'startPauseTask':
                    task = getExistingTask(msg.data);
                    console.log('here 1');
                    if (task) {
                        console.log('here 2');
                        task.start();
                    } else {
                        console.log('new task:');
                        console.log(msg.data);
                        var newTask = new Task(self, msg.data);
                        tasks.push(newTask);
                        newTask.start();
                    }
                    break;
                case 'stopTask':
                    console.log('stopTask');
                    task = getExistingTask(msg.data);
                    if (task) {
                        task.justStop();
                    }
                    break;
                case 'getAllTasks':
                    var foundedTasks = getAllTasks(msg.data);
                    console.log(tasks.length)
                    if (foundedTasks.length) {
                        console.log(foundedTasks);
                        self.s.sockets.in(room).emit(msg.command, {
                            tasks: foundedTasks
                        });
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
                            memoryUsage: process.memoryUsage(),
                            tasks: _.map(tasks, function (task) {
                                return {
                                    username: task.username,
                                    accountId: task.accountId,
                                    uid: task.uid,
                                }
                            })
                        }
                    });
                    break;
                case 'sendMemoryUsage':
                    self.s.sockets.in('memoryUsage').emit('memoryUsage', msg.data);
                    break;
            }
        }
    });

    self.s.set('authorization', function (handshakeData, accept) {

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

    self.s.sockets.on('connection', function (socket) {

        var user = {
            username: socket.request.username
        };

        socket.join(user.username);
        socket.join(user.username + ':uploadFile');

        var onevent = socket.onevent;

        socket.onevent = function (packet) {
            var args = packet.data || [];
            var command = args[0];
            var data = args[1];
            console.log(process.pid + ': [' + self.getUserNameString(user) + '] command [' + command + ']');
            if (validatePacketData(command, data)) {

                var roomsWhereUserIs = [];
                for (var k in self.s.sockets.adapter.rooms) {
                    if (k.indexOf(user.username) > -1)
                        roomsWhereUserIs.push(k);
                }
                user.roomsWhereUserIs = roomsWhereUserIs;

                switch (command) {
                    case 'join':

                        switch (data.processId) {
                            case 'memoryUsage':
                                socket.join(data.processId);
                                break;
                            default :
                                user.processId = data.processId;
                                socket.join(self.getUserNameString(user));
                        }
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
                    case 'createTask':
                        /* process.send({
                         command: command,
                         data: extend({}, user, {
                         settings: data.settings,
                         uid: uuid.v1()
                         })
                         });
                         break;*/
                        console.error('21111111');
                    case 'startPauseTask':
                    case 'stopTask':

                        //  console.log('socket data: ');
                        // console.log(data);

                        process.send({
                            command: command,
                            data: extend({}, user, data)
                        });
                        break;
                    case 'getAllTasks':
                        /* process.send({
                         command: command,
                         data: extend({}, user, {
                         // uid: data.uid
                         })
                         });*/
                        console.error('21111112');
                        return;
                }

                switch (command) {
                    default:
                        onevent.call(this, packet);
                }


            } else {
                console.error(process.pid + ': [' + self.getUserNameString(user) + '] validation error [' + command + ']');
                this.emit('clientError', {
                    notify: 'Команда сокета не прошла проверку',
                    type: 4
                });
            }
        };


        socket.on('disconnect', function (inData) {
            console.log(process.pid + ': [' + self.getUserNameString(user) + '] disconnected');
        });


        socket.on('getAllProcesses', function (inData) {
            process.send({
                command: 'getAllProcesses',
                data: extend({}, user)
            });
        });
    })
};

sio.prototype.getUserNameString = function (data) {
    return data.username + (data.accountId ? ':' + data.accountId + (data.processId ? ':' + data.processId : '') : '');
};

module.exports = sio;
