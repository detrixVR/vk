"use strict"

var validateProxy = require('./processes/validateProxy');
var request = require('request');
var extend = require('extend');


var CALLBACK_TYPES = [
    'stop', //0
    'start', //1
    'pause', //2
    'msg', //3
    'refreshRow', //4
];

function start(callback) {

    callback(null, {
        cbType: 3,
        msg: this.createMsg({msg: 'live'})
    });

    var d = null;


    var that = this;

    if (this.state.state !== 0) {

        if (this.state.state !== 2) {
            setTimeout(function () {
                start.apply(that, [callback]);
            }, 1000);
        } else {
            var d = null;
            callback(null, {
                cbType: 2,
                msg: that.createMsg({msg: 'Пауза'})
            });
            var delay = function () {
                console.log('delay');
                if (that.state.state === 2) {
                    d = setTimeout(delay, 1000);
                } else {
                    clearTimeout(d);
                    start.apply(that, [callback]);
                }
            };
            delay();

        }


    } else {

        return callback(null, {
            cbType: 0,
            msg: this.createMsg({msg: 'Стоп'})
        });
    }
}

class Process {

    constructor(user, options) {

        this.options = extend({
            messages: []
        }, options);

        this.user = user;
        this.state = {
            state: 0
        };
    }

    createMsg(options) {

        var defOptions = {
            time: Date.now(),
            msg: 'text',
            type: 0,
            clear: false
        };

        return extend(defOptions, options);
    }

    start() {
        this.user.socket.emit('setState', 3);

        switch (this.state.state) {
            case 0:
                this.state.state = 1;

                switch (this.options.processId) {
                    case 'test':
                        eval('validateProxy').apply(this, [this.options.settings, (err, cbData) => {

                                if (cbData.hasOwnProperty('msg')) {
                                    this.options.messages.push(cbData.msg);
                                }

                                switch (cbData.cbType) {
                                    case 0:
                                        this.user.archiveProcess(this.options, (err)=> {
                                            var obj = {state: {state: cbData.cbType}};
                                            if (err) {
                                                cbData.msg = this.createMsg({msg: 'Ошибка сервера'});
                                            }
                                            this.user.socket.emit('setState', extend(obj, cbData));
                                        });
                                        break;
                                    case 1:
                                    case 2:
                                        this.user.socket.emit('setState', extend({
                                            state: cbData.cbType
                                        }, cbData));
                                        break;
                                    case 3:
                                        this.user.socket.emit('printEvent', cbData.msg);
                                        break;
                                    case 4:
                                        this.user.socket.emit('refreshRow', cbData);
                                        break;
                                }
                            }]);
                        break;
                }
                break;
            case 1:
                this.pause();
                break;
            case 2:
                this.state.state = 1;
                break;
        }
    }


    pause() {
        this.state.state = 2;
    }

    stop() {
        this.state.state = 0;
    }
}

module.exports = Process;