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
                    username: socket.request.username,
                    accountId: 1,
                    pageId: 'mainPage'
                };

                intel.debug(`${process.pid}: [${self.getUserNameString(user)}] connected`);

                self.Instance.addAccount({
                    username: user.username,
                    accountId: user.accountId
                }, function (err) {
                    if (err) {
                        intel.error(err);
                    } else {

                        socket.emit('setAccountPage');
                        socket.join(user.username);
                        socket.join(user.username + ':uploadFile');
                        socket.join(self.getUserNameString(user));

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
                                                        intel.error(err);
                                                    } else {
                                                        socket.join(self.getUserNameString(user));
                                                        socket.emit('setAccountPage');
                                                    }
                                                });
                                        }
                                        return;
                                }

                                switch (command) {
                                    case 'getCurrentTask':
                                    case 'getCurrentTasks':
                                    case 'stopTask':
                                        console.log(roomsWhereUserIs);
                                        return self.hub.requestMaster(command, extend({}, user, data));
                                }

                                switch (command) {
                                    case 'stopTask':
                                        return self.hub.requestMaster(command, extend({}, user, data));
                                    case 'startPauseTask':
                                        return self.hub.requestMaster(command, extend({}, user, data));
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

                        socket.on('disconnect', function () {

                            for (var k in roomsWhereUserIs) {
                                if (k.indexOf(user.username) > -1)
                                    this.leave(k);
                            }
                            console.log(`${process.pid}: [${self.getUserNameString(user)}] disconnected`);
                        });
                    }
                });
            });

            this.initialized = true;
        }

        return this;
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