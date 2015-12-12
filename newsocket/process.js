"use strict";
var extend = require('extend');
class Process {

    constructor(worker, broadcast, data) {
        this.processId = data.processId;
        this.data = data;
        this.state = 0;
        this.worker = worker;
        this.broadcast = broadcast;
    }


    start() {

        switch (this.state) {
            case 0:
                this.state = 1;
                this.worker.send({
                    command: 'startProcess',
                    data: extend(this.data, {state: this.state})
                });
                return (0);
            case 1:
                this.state = 2;
                break;
            case 2:
                this.state = 1;
                break;
        }

        this.broadcast({
            command: 'setProcessState',
            data: extend(this.data, {state: this.state})
        });
    }



    stop() {
        this.state = 0;
    }
}

module.exports = Process;