"use strict";
var extend = require('extend'),
    dbAccount = require('models/account').Account,
    utils = require('modules/utils'),
    settings = require('newsocket/tasks/settings'),
    uuid = require('node-uuid'),
    Task = require('newsocket/Classes/Task'),
    async = require('async'),
    intel = require('intel'),
    _ = require('underscore');


class Account {

    constructor(Socket, data) {
        this.Socket = Socket;
        this.uid = data.uid;
        this.username = data.username;
        this.accountId = data.accountId;
        this.tasks = [];

        intel.debug(`Создан новый аккаунт: ${data.username}:${data.accountId}`);
    }

    getExistingTask(data) {
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
    }

    save(callback) {

        let self = this;

        async.each(this.tasks, function (task, callback) {
            return task.save(callback);
        }, function (err) {
            if (err) {
                return callback(err);
            } else {
                dbAccount.update({
                    uid: self.uid
                }, {
                    uid: self.uid,
                    username: self.username,
                    accountId: self.accountId,
                    tasks: _.map(self.tasks, function (item) {
                        return item.uid;
                    })
                }, {
                    upsert: true,
                    setDefaultsOnInsert: true
                }, callback);
            }
        });
    }
}

module.exports = Account;