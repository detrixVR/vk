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


    start() {

        switch (this.state.state) {
            case 0:
                this.state.state = 1;

                eval(this.options.processId).apply(this, [this.options.settings, (err, cbData) => {

                    if (cbData.hasOwnProperty('msg')) {
                        this.options.messages.push(cbData.msg);
                    }

                    switch (cbData.cbType) {
                        case 0:
                            this.user.archiveProcess(this.options, (err)=> {
                                var obj = {state: cbData.cbType};
                                if (err) {
                                    cbData.msg = utils.createMsg({msg: 'Ошибка сервера'});
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
            case 1:
                this.pause();
                break;
            case 2:
                this.state.state = 1;
                this.user.socket.emit('setState', {
                    state: 1
                });
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