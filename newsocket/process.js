"use strict";
var extend = require('extend');
var dbProcess = require('../models/process').Process;


class Process {

    constructor(data) {
        this.username = data.username;
        this.processId = data.processId;
        this.accountId = data.accountId;
        this.settings = data.settings;
        this.title = data.title;
        this.messages = [];
        this.state = 0;
    }


    start() {
        this.state = 1;
    }

    pause() {
        this.state = 2;
    }

    stop() {
        this.state = 0;
    }

    getState() {
        return this.state;
    }

    save(callback) {
        var newProcess = dbProcess({
            username: this.username,
            accountId: this.accountId,
            processId: this.processId,
            messages: this.messages || [],
            settings: this.settings,
            state: this.getState()
        });
        newProcess.save(function (err) {
            return callback(err ? err : null)
        });
    }
}

module.exports = Process;