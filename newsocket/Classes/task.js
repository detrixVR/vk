"use strict";
var extend = require('extend');
var dbTask = require('../../models/task').Task;
var utils = require('modules/utils');

var tasks = require('newsocket/tasks');
var settings = require('newsocket/tasks/settings');

class Task {

    constructor(Account, data) {
        this.Account = Account;
        this.accountUid = Account.uid;
        this.room = this.Account.Socket.getUserNameString(data);
        this.username = data.username;
        this.accountId = data.accountId;
        this.pageId = data.pageId;
        this.uid = data.uid;
        this.taskName = data.taskName;
        this.settings = data.settings;
        this.messages = [];
        this.state = 0;
    }


    start() {

        switch (this.getState()) {
            case 0:
                this.state = 1;


                let splitArray = this.taskName.split('_');

                console.log(this.taskName);

                switch (splitArray[0]) {
                    case 'gridRefreshItem':
                    case 'searchPeoples':
                    case 'searchGroups':

                        let error = utils.validateSettings(this.settings, settings[splitArray[0]]);

                        if (error) {
                            console.error(error);

                            this.pushMesssage(utils.createMsg({
                                msg: error.msg,
                                clear: true,
                                type: 1,
                                badFields: error.badFields
                            }));

                            this.stop(() => {
                                return (0);
                            });
                        } else {
                            eval(tasks[splitArray[0]])(this, (err, cbData) => {

                                if (err) {

                                    //var resp = utils.processAnyError(err);


                                   // console.error( resp);
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
                        }


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
        this.Account.Socket.s.sockets.in(this.room).emit('setTaskState', {
            taskName: this.taskName,
            state: this.getState()
        });
    }

    sendMessage(msg) {
        this.Account.Socket.s.sockets.in(this.room).emit('printEvent', extend({}, {
            uid: this.uid
        }, {
            msg: msg
        }));
    }

    sendEvent(data) {
        this.Account.Socket.s.sockets.in(this.room).emit(data.eventName, extend({}, {
            taskName: this.taskName
        }, data));
    }

    justStop() {
        this.state = 0;
    }

    stop(callback) {

        this.state = 0;

        this.sendState();

        this.Account.justStopTask({
            uid: this.uid
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

        dbTask.update({
            uid: this.uid
        }, {
            username: this.username,
            accountId: this.accountId,
            accountUid: this.accountUid,
            messages: this.messages || [],
            settings: this.settings,
            state: this.getState(),
            uid: this.uid
        }, {
            upsert: true,
            setDefaultsOnInsert: true
        }, function (err) {
            return callback(err ? err : null)
        });

    }
}

module.exports = Task;