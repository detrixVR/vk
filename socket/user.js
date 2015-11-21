"use strict"

var Process = require('./process');

class User {
    constructor(user){
        this.username = user.username;
        this.socket = user.socket;
        this.processes = [];
    }

    findProcessById(pageId) {
        var process = null;
        for (var i = 0; i < this.processes.length; i++) {
            if (this.processes[i].pageId === pageId) {
                process = this.processes[i];
                break;
            }
        }
        return process;
    }

    setProcess(process) {
        if (process.pageId) {
            var currentProcess = this.findProcessById(process.pageId);
            console.log(process)
            switch (process.event) {
                case 'start':
                    if (currentProcess) {
                        currentProcess.start();
                    } else {
                        var options = {
                            pageId: process.pageId,
                            processId: process.processId,
                            settings: process.settings
                        };
                        var newProcess = new Process(this, options);
                        this.processes.push(newProcess);
                        newProcess.start();
                        console.log(options);
                    }
                    break;
                case 'pause':
                    break;
                case 'stop':
                    break;
            }
        }
    }
}

module.exports = User;