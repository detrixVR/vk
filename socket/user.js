"use strict"

var Process = require('./process');
var dbProcess = require('../models/process');

class User {
    constructor(user) {
        this.username = user.username;
        this.socket = user.socket;
        this.processes = [];
    }

    archiveProcess(options) {

        var processIndex = -1;

        for (var i = 0; i < this.processes.length; i++) {
            if (this.processes[i].pageId === options.pageId) {
                processIndex = i;
                break;
            }
        }

        if (processIndex > -1) {

            this.processes.splice(processIndex, 1);

            /*
            dbProcess.findAndModify({
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
                    if (err) throw err;
                    console.log(doc);
                })*/

        }


    }
}

module.exports = User;