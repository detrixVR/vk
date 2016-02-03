"use strict";
var extend = require('extend'),

    dbAccount = require('models/account'),
    dbTask = require('models/task'),

    utils = require('modules/utils'),
    settings = require('newsocket/tasks/settings'),
    uuid = require('node-uuid'),
    Task = require('newsocket/Classes/Task'),
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
    }

    startPauseTask(data) {
        let task = this.getExistingTask(data);
        if (task) {
            task.start();
        } else {
            var newTask = new Task(this, extend({}, data, {
                uid: uuid.v1()
            }));
            this.tasks.push(newTask);
            newTask.start();
        }
    }

    stopTask(data) {
        console.log('stopTask');
        let task = this.getExistingTask(data);
        if (task) {
            task.justStop();
        }
    }

    justStopTask(data) {

        console.log('JustStop');
        var task = this.getExistingTask(data);
        if (task) {
            this.tasks.splice(this.tasks.indexOf(task), 1);

            console.log(this.tasks);
        }
    }*/

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
        let self = this;
        let task = this.getTaskByName(data);
        if (task) {
            let  newTask = new Task(self, data);
            this.tasks.push(newTask);
            newTask.init(function(err){
                if(err) {
                    intel.error('Невозможно создать аккаунт');
                } else {
                    process.send({
                        command: 'taskReady', data: {
                            instanceSn: self.Account.Instance.sn,
                            accountUid: self.Account.uid,
                            uid: newTask.uid
                        }
                    });
                }
            })
        } else {
            intel.warning('Попытка добавить существующий таск');
        }
    }

    getTaskByName(data){
        return _.find(this.tasks, function (item) {
            return item.taskName === data.taskName;
        })
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