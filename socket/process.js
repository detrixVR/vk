"use strict"

var validateProxy = require('./processes/validateProxy');
var request = require('request');

function start() {

    if (this.state == 1) {
        this.user.socket.emit('time', 'live');
    } else if (this.state == 2) {
        console.log('here');
        this.user.socket.emit('setState', 2);
    }

    var that = this;

    if (this.state !== 0) {
        setTimeout(function () {
            start.call(that);
        }, 1000);
    } else {
        this.user.socket.emit('setState', 0);
    }
}

class Process {
    constructor(user, options) {
        this.user = user;
        this.pageId = options.pageId;
        this.processId = options.processId;
        this.settings = options.settings;
        this.messages = [];
        this.state = null;
    }

    getState() {
        return this.state
    }

    start() {
        this.user.socket.emit('setState', 3);
        if (!this.state) {
            this.state = 1;
            switch (this.processId) {
                case 'test':
                    start.call(this);
                    this.messages.push({time: Date.now(), msg: 'Старт', type: 0, clear: true});
                    this.user.socket.emit('setState', 1);
                    break;
            }
        } else if (this.state === 1) { //pause
            this.messages.push({time: Date.now(), msg: 'Пауза'});
            this.state = 2;
        } else if (this.state === 2) {
            this.state = 1;
            this.messages.push({time: Date.now(), msg: 'Старт'});
            this.user.socket.emit('setState', 1);
        }
    }

    stop() {
        this.user.socket.emit('setState', 3);
        this.messages.push({time: Date.now(), msg: 'Стоп'});
        //this.state = 0; //???
        this.user.archiveProcess({
            pageId : this.pageId
        });
        console.log(this.user.processes)
    }

    pause() {
        this.state = 2;
    }
}

module.exports = Process;