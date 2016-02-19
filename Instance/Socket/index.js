"use strict";

var extend = require('extend'),
    async = require('async'),
    _ = require('underscore'),
    io = require('socket.io'),
    intel = require('intel'),
    config = require('config'),
    cookieParser = require('cookie-parser'),
    Account = require('Instance/Account'),
    cookie = require('cookie');


const COMMANDS_DATA = [
    {
        command: 'join',
        fields: [
            {
                pageId: {
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

class Socket {

    constructor(Instance) {

        this.Instance = Instance;
        this.s = io.listen(GLOBAL.server);
        this.hub = GLOBAL.hub;
        this.initialized = false;
    }

    init() {
        if (!this.initialized) {

            var self = this;

            this.s.set('authorization', function (handshakeData, accept) {

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

            this.s.sockets.on('connection', function (socket) {

                let roomsWhereUserIs = [];

                let user = {
                    username: socket.request.username
                };

                intel.debug(`${process.pid}: [${self.getUserNameString(user)}] connected`);
              //  console.log(`${process.pid}: [${self.getUserNameString(user)}] connected`);

                socket.join(user.username);
                socket.join(user.username + ':uploadFile');

                var oldOnEvent = socket.onevent;

                socket.onevent = function (packet) {

                    var args = packet.data || [];
                    var command = args[0];
                    var data = args[1];

                    if (self.validatePacketData(command, data)) {

                        intel.debug(`${process.pid}: socket command [${command}] from [${self.getUserNameString(user)}]`);

                        roomsWhereUserIs = [];

                        for (var k in self.s.sockets.adapter.rooms) {
                            if (k.indexOf(user.username) > -1)
                                roomsWhereUserIs.push(k);
                        }

                        switch (command) {
                            case 'joinAccountPage':
                                switch (data.pageId) {
                                    default :
                                        if (user.accountId) {
                                            for (var k in roomsWhereUserIs) {
                                                if (k.indexOf(user.accountId) > -1)
                                                    socket.leave(k);
                                            }
                                        }
                                        user.pageId = data.pageId;
                                        user.accountId = data.accountId;

                                        self.Instance.addAccount({
                                            username: user.username,
                                            accountId: user.accountId
                                        }, function (err) {
                                            if (err) {
                                                intel.error('Невозможно создать аккаунт');
                                            } else {
                                                //socket.join(`${user.username}:${user.pageId}`);
                                                socket.join(self.getUserNameString(user));
                                                socket.emit('setAccountPage');
                                            }
                                        });
                                }
                                return;
                        }

                        switch (command) {
                            //case 'createTask':
                          //  case 'startPauseTask':
                            case 'getCurrentTask':
                            case 'getCurrentTasks':
                            case 'stopTask':
                                /*process.send({
                                 command: command,
                                 data: extend({}, user, data)
                                 });*/
                                console.log(roomsWhereUserIs)
                                return self.hub.requestMaster(command, extend({}, user, data));
                        }

                        switch (command) {
                            case 'createTask':
                                return self.Instance.createTask(extend({}, user, data));
                            case 'startPauseTask':
                               // console.log(roomsWhereUserIs)
                                return self.Instance.startPauseTask(extend({}, user, data));
                        }

                        switch (command) {
                            case 'getStatistic':
                                process.send({
                                    command: command,
                                    data: extend({}, user, data)
                                });
                                return;
                        }

                        switch (command) {
                            default:
                                oldOnEvent.call(socket, packet);
                        }


                    } else {

                        socket.emit('clientError', {
                            notify: 'Команда сокета не прошла проверку',
                            type: 4
                        });
                    }
                };

                //socket.on('connect',function(){
                  // console.log('single connect');
               // });

                socket.on('disconnect', function () {

                    for (var k in roomsWhereUserIs) {
                        if (k.indexOf(user.username) > -1)
                            this.leave(k);
                    }
                    console.log(`${process.pid}: [${self.getUserNameString(user)}] disconnected`);
                });
            });

            /*process.on('message', function (msg) {

             if (msg.data && msg.data.username && msg.data.accountId) {

             let account = null;
             let task = null;


             var credentials = {
             username: msg.data.username,
             accountId: msg.data.accountId,
             pageId: msg.data.pageId
             };

             let room = self.getUserNameString(credentials);

             switch (msg.command) {
             case 'addAccount':
             console.log('addAccount');
             account = self.getExistingAccount(extend({}, msg.data, credentials));
             if (!account) {
             var newAccount = new Account(self, extend({}, msg.data, credentials));
             self.accounts.push(newAccount);
             }
             break;
             case 'createTask':
             account = self.getExistingAccount(extend({}, msg.data, credentials));
             if (account) {
             account.createTask(extend({}, msg.data, credentials));
             }
             break;
             case 'startPauseTask':
             account = self.getExistingAccount(extend({}, msg.data, credentials));
             if (account) {
             account.startPauseTask(extend({}, msg.data, credentials));
             }
             break;
             case 'stopTask':
             account = self.getExistingAccount(extend({}, msg.data, credentials));
             if (account) {
             account.stopTask(extend({}, msg.data, credentials));
             }
             break;
             case 'getCurrentTask':
             account = self.getExistingAccount(extend({}, msg.data, credentials));
             if (account) {
             task = _.find(account.tasks, function (item) {
             return item.pageId === msg.data.pageId
             }) || null
             }
             self.s.sockets.in(room).emit('setTask', task ? {
             uid: task.uid,
             settings: task.settings,
             messages: task.messages,
             state: task.state
             } : task);
             break;
             default:
             console.log('default ' + msg.command);
             }
             } else {
             switch (msg.command) {
             case 'memoryUsage':
             // console.log(self.accounts);
             process.send({
             command: 'setMemoryUsage',
             data: {
             processPid: process.pid,
             memoryUsage: process.memoryUsage(),
             accounts: _.map(self.accounts, function (account) {
             return {
             uid: account.uid,
             username: account.username,
             accountId: account.accountId,
             tasks: _.map(account.tasks, function (task) {
             return {
             uid: task.uid,
             taskName: task.taskName
             }
             })
             }
             })
             }
             });
             break;
             case 'sendMemoryUsage':
             self.s.sockets.in('memoryUsage').emit('memoryUsage', msg.data);
             break;
             default:
             console.log('default1 ' + msg.command);
             }
             }
             });*/

            this.initialized = true;
        }

        return this;
    }

    getExistingAccount(data) {

        var account = null;

        for (var k = 0; k < this.accounts.length; k++) {
            if (this.accounts[k].uid === data.account.uid) {
                account = this.accounts[k];
                break;
            }
        }

        return account;
    }

    getUserNameString(data) {
        return data.username + (data.accountId ? ':' + data.accountId + (data.pageId ? ':' + data.pageId : '') : '');
    }

    validatePacketData(command, data) {
        for (var i = 0; i < COMMANDS_DATA.length; i++) {
            if (COMMANDS_DATA[i].command === command) {
                for (var k = 0; k < COMMANDS_DATA[i].fields.length; k++) {
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

}

module.exports = Socket;