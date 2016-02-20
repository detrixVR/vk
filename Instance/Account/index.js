"use strict";
var extend = require('extend'),

    dbAccount = require('models/account'),
    dbTask = require('models/task'),

    utils = require('modules/utils'),
    settings = require('newsocket/tasks/settings'),
    uuid = require('node-uuid'),
    Task = require('Instance/Task'),
    async = require('async'),
    intel = require('intel'),
    _ = require('underscore');


class Account {

    constructor(Instance, options) {

        this.Instance = Instance;

        let defaults = {
            uid: null,
            username: null,
            accountId: null
        };

        extend(defaults, options);

        this.uid = defaults.uid;
        this.username = defaults.username;
        this.accountId = defaults.accountId;

        this.tasks = [];
        this.initialized = false;

        intel.debug(`Создан новый аккаунт: ${this.username}:${this.accountId}`);
    }

    /* getExistingTask(data) {
     var task = null;

     for (var k = 0; k < this.tasks.length; k++) {
     if (this.tasks[k].uid === data.uid) {
     task = this.tasks[k];
     break;
     }
     }

     return task;
     }

     createTask(data) {
     let task = this.getExistingTask(data);
     if (!task) {
     var newTask = new Task(this, extend({}, data, {
     uid: uuid.v1()
     }));
     this.tasks.push(newTask);
     }
     }*/


    /*
     stopTask(data) {
     console.log('stopTask');
     let task = this.getExistingTask(data);
     if (task) {
     task.justStop();
     }
     }
     */
    justStopTask(Task) {
        this.tasks.splice(this.tasks.indexOf(Task), 1);
    }

    init(callback) {
        let self = this;

        if (!this.initialized) {

            dbTask.find({account: this.uid, state: {$gt: 0}}, function (err, docs) {
                if (err) {
                    return callback(err);
                } else {
                    return async.each(docs, function (item, callback) {
                        let newTask = new Task(self, item);
                        self.tasks.push(newTask);
                        return newTask.init(callback);
                    }, callback);
                }
            });

            this.initialized = true;
        }
    }

    addTask(data) {

        data.state = data.start ? 0 : 1;

        let newTask = new Task(this, data);
        newTask.init((err) => {
            if (err) {
                intel.error(err);
            } else {
                this.tasks.push(newTask);
                GLOBAL.hub.requestMaster('taskReady', {
                    instanceSn: this.Instance.sn,
                    accountUid: this.uid,
                    uid: newTask.uid
                });
            }
        })

    }

    startPauseTask(data) { //username: 'huyax', pageId: 'mainPage', settings: {}
        console.log(data);
        let task;
        if (data.pageId) {
            task = this._getTaskByPageId(data);
        } else {
            task = this._getTaskByUid(data);
        }
        if (task) {
            console.log('start');
            task.start();
        } else {
            this.addTask(data);
        }
    }

    _getTaskByPageId(data) {
        return _.find(this.tasks, function (item) {
            return item.pageId === data.pageId;
        })
    }

    _getTaskByUid(uid) {
        return _.find(this.tasks, function (item) {
            return item.uid === uid;
        })
    }

    _getHistoryTaskByUid(uid, callback) {
        return dbTask.findOne({uid: uid}, callback);
    }

    getCurrentTask(uid, callback) {
        let self = this;

        let task = _getTaskByUid(uid);
        if (!task) {
            return _getHistoryTaskByUid(uid, callback);
        } else {
            return callback(null, task);
        }
    }

    save(callback) {

        let self = this;

        async.each(this.tasks, function (task, callback) {
            return task.save(callback);
        }, function (err) {
            if (err) {
                return callback(err);
            } else {
                return dbAccount.update({
                    uid: self.uid
                }, {
                    uid: self.uid,
                    instance: self.Instance.sn,
                    username: self.username,
                    accountId: self.accountId
                }, {
                    upsert: true,
                    setDefaultsOnInsert: true
                }, callback);
            }
        });
    }
}

module.exports = Account;