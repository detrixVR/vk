"use strict";
var extend = require('extend');

var dbAccount = require('models/account').Account;
var utils = require('modules/utils');
var settings = require('newsocket/tasks/settings');
var uuid = require('node-uuid');


var Task = require('newsocket/Classes/Task');

var async = require('async');
var _ = require('underscore');


class Account {

    constructor(Socket, data) {
        this.Socket = Socket;
        this.uid = data.uid;
        this.username = data.username;
        this.accountId = data.accountId;
        this.tasks = [];
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

        dbAccount.update({
            uid: this.uid
        }, {
            uid: this.uid,
            username: this.username,
            accountId: this.accountId,
            tasks: _.map(this.tasks, function (item) {
                return item.uid;
            })
        }, {
            upsert: true,
            setDefaultsOnInsert: true
        }, function (err) {
            return callback(err ? err : null)
        });
    }
}

module.exports = Account;