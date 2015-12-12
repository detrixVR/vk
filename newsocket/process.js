"use strict";
var extend = require('extend');
class Process {

    constructor(master, data) {
        this.processId = data.processId;
        this.data = data;
        this.state = 0;
        this.master = master;
    }


    start() {

        if (this.state === 2) {
            this.state = 1;
        } else {
            this.state = 2;
        }

        this.master.broadcast({
            command: 'setProcessState',
            data: extend(this.data, {state: this.state})
        });
    }



    stop() {
        this.state = 0;
    }
}

module.exports = Process;