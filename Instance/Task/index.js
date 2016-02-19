"use strict";
var extend = require('extend'),
    dbTask = require('models/task'),
    utils = require('modules/utils'),
    tasks = require('newsocket/tasks'),
    intel = require('intel'),
    settings = require('newsocket/tasks/settings');

class Task {

    constructor(Account, options) {

        this.Account = Account;

        let defaults = {
            uid: null,
            pageId: null,
            settings: [],
            messages: [],
            initLoop: 0,
            state: 0
        };

        extend(defaults, options);


        this.uid = defaults.uid;
        this.room = this.Account.Instance.Socket.getUserNameString(options);
        this.settings = defaults.settings;
        this.messages = defaults.messages;
        this.pageId = defaults.pageId;

        this.initLoop = defaults.initLoop || 0;
        this.initState = defaults.state;

        this.state = 0;//defaults.state;

        intel.debug(`Создан новый task: [${this.room}]`);
    }


    start() {

        switch (this.getState()) {
            case 0:
            {
                this.state = 1;

                switch (this.pageId) {
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
            }
                break;
            case 2:
            {
                this.state = 1;
            }
                break;
            case 1:
            {
                this.pause();
            }
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

    init(callback) {
        let self = this;

        if (!this.initialized) {

            switch (this.initState) {
                case 1:
                    this.start();
                    break;
                case 2:
                    this.pause();
                    break;
                default:
                    return callback(new Error('task wrong state'));
            }

            return callback();

            this.initialized = true;
        }
    }

    save(callback) {

        dbTask.update({
            uid: this.uid
        }, {
            uid: this.uid,
            account: this.Account.uid,
            messages: this.messages || [],
            settings: this.settings,
            initLoop: this.initLoop,
            state: this.getState()
        }, {
            upsert: true,
            setDefaultsOnInsert: true
        }, function (err) {
            return callback(err ? err : null)
        });

    }
}

module.exports = Task;