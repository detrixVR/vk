"use strict";
var extend = require('extend');
var utils = require('../modules/utils');
var dbTask = require('../models/task').Task;
var utils = require('modules/utils');

var gridRefreshItem = require('./tasks/gridRefreshItem');


class Task {

    constructor(sio, data) {
        this.sio = sio;
        this.room = sio.getUserNameString(data);
        this.username = data.username;
        this.accountId = data.accountId;
        this.uid = data.uid;
        this.settings = data.settings;
        this.messages = [];
        this.state = 0;
    }


    start() {

        switch (this.getState()) {
            case 0:
                this.state = 1;

                this.taskName = this.uid.split('_')[0];


                console.log(this.taskName);
                console.log(this.uid);

                switch (this.taskName) {
                    case 'gridRefreshItem':

                        eval(this.taskName)(this, (err, cbData) => {

                            if (err) {

                                var resp = utils.processAnyError(err);


                                console.error(err);

                                this.stop(() => {
                                    return (0);
                                });
                            } else {
                                switch (cbData.cbType) {
                                    case 0:
                                        this.stop(() => {
                                            return (0);
                                        });
                                }
                            }

                        });

                        break;
                    default:

                        this.pushMesssage(utils.createMsg({msg: 'Неизвестный процесс'}));

                        this.stop(() => {
                            return (0);
                        });
                }


                break;
            case 2:
                this.state = 1;
                break;
            case 1:
                this.pause();
                break;
        }

        this.sendState();
    }

    pause() {
        this.state = 2;
    }

    sendState() {
        this.sio.s.sockets.in(this.room).emit('setTaskState', {
            username: this.username,
            accountId: this.accountId,
            uid: this.uid,
            state: this.getState()
        });
    }

    sendMessage(msg) {
        this.sio.s.sockets.in(this.room).emit('printEvent', extend({}, {
            username: this.username,
            accountId: this.accountId,
            uid: this.uid
        }, {
            msg: msg
        }));
    }

    sendEvent(data) {
        this.sio.s.sockets.in(this.room).emit(data.eventName, extend({}, {
            username: this.username,
            accountId: this.accountId,
            uid: this.uid
        }, data));
    }

    justStop() {
        this.state = 0;
    }

    stop(callback) {

        this.state = 0;

        this.sendState();

        this.sio.justStopTask({
            username: this.username,
            accountId: this.accountId,
            uid: this.uid
        });

        process.send({
            command: 'justStopTask',
            data: {
                username: this.username,
                accountId: this.accountId,
                uid: this.uid
            }
        });

        this.save(function () {
            return callback();
        });
    }


    pushMesssage(msg) {

        this.messages.push(msg);

        this.sendMessage(msg);
    }

    getState() {
        return this.state;
    }

    save(callback) {
        var newTask = dbTask({
            username: this.username,
            accountId: this.accountId,
            messages: this.messages || [],
            settings: this.settings,
            state: this.getState(),
            uid: this.uid
        });
        newTask.save(function (err) {
            return callback(err ? err : null)
        });
    }
}

module.exports = Task;