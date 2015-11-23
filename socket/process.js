"use strict"

var validateProxy = require('./processes/validateProxy');
var request = require('request');


function start(user) {
    // console.log('live');
    user.socket.emit('time', 'live');
    setTimeout(function () {
        start(user)
    }, 1000);
}

class Process {
    constructor(user, options) {
        this.user = user;
        this.pageId = options.pageId;
        this.processId = options.processId;
        this.settings = options.settings;
        this.state = null;
    }

    getState() {
        return this.state
    }

    start() {

        if (!this.getState()) {

            this.state = 1;

            switch (this.processId) {
                case 'test':
                    console.log('start test process');
                    var that = this;
                    validateProxy(this, {}, function (err, data) {
                        if (err) {
                            that.stop();
                        } else {
                            console.log('callback');
                            switch(data.type) {
                                case 'gridRowEvent':
                                    that.user.socket.emit('gridRowEvent', data);
                                    break;
                                case 'done':
                                    that.stop();
                                    that.user.socket.emit('eventMsg', {
                                        msg: 'Процесс успешно завершен'
                                    });
                                    break;
                                default :
                                    that.stop();
                            }
                        }
                    });
                    break;
            }

        } else {
            console.log('can\'t start process twice');
        }
    }

    stop() {
        console.log('stop');
        this.state = 0;
        /*this.user.setProcess({
            event: 'stop',
            pageId: this.pageId
        })*/
    }

    pause() {
        this.state = 2;
    }
}

module.exports = Process;