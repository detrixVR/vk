"use strict";
var extend = require('extend');
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
}

module.exports = Process;