"use strict";

var Process = require('./process');
var dbProcess = require('../models/process').Process;

class User {

    constructor(user) {
        this.username = user.username;
        this.socket = user.socket;
        this.accounts = [];
    }

    archiveProcess(options, callback) {

        var account = null;

        for (var k = 0; k < this.accounts.length; k++) {
            if (this.accounts[k].accountId === options.accountId) {
                account = this.accounts[k];
                break;
            }
        }

        if (account) {
            var processIndex = -1;

            for (var i = 0; i < account.processes.length; i++) {
                if (account.processes[i].options.accountId === options.accountId) {
                    processIndex = i;
                    break;
                }
            }

            if (processIndex > -1) {

                account.processes.splice(processIndex, 1);

                dbProcess.update({
                        username: this.username,
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
        } else {
            return callback();
        }
    }

    getArchivedProcess(options, callback) {
        dbProcess.findOne({
            username: this.username,
            pageId: options.pageId,
            accountId: options.accountId
        }, function (err, doc) {
            return callback(err ? err : null, doc);
        })
    }
}

module.exports = User;