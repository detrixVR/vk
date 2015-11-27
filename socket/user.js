"use strict"

var Process = require('./process');
var dbProcess = require('../models/process').Process;

class User {
    constructor(user) {
        this.username = user.username;
        this.socket = user.socket;
        this.processes = [];
    }

    archiveProcess(options, callback) {

        var processIndex = -1;

        for (var i = 0; i < this.processes.length; i++) {
            if (this.processes[i].options.pageId === options.pageId) {
                processIndex = i;
                break;
            }
        }

        if (processIndex > -1) {

            this.processes.splice(processIndex, 1);

            dbProcess.update({
                    username: this.username,
                    pageId: options.pageId,
                    accountId: options.accountId
                }, {
                    $set: {
                        settings: options.settings,
                        messages: options.messages
                    }
                }, {
                    new: true,
                    upsert: true
                },
                function (err, doc) {
                    return callback(err ? err : null, doc);
                })

        } else {
            return callback();
        }


    }

    getArchivedProcess(options, callback) {
        dbProcess.findOne({
            username: this.username,
            pageId: options.pageId,
           // accountId: options.accountId //TODO
        }, function (err, doc) {
            return callback(err ? err : null, doc);
        })
    }
}

module.exports = User;