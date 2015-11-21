"use strict"


function start(user) {
   // console.log('live');
    user.socket.emit('time', 'live');
    setTimeout(function(){start(user)}, 1000);
}

class Process {
    constructor (user, options) {
        this.user           = user;
        this.pageId         = options.pageId;
        this.processId      = options.processId;
        this.settings       = options.settings;
        this.state          = null;
    }

    getState() {
        return this.state
    }

    start(){

        if (!this.getState()) {
            switch (this.processId) {
                case 'test':
                    console.log('start test process');
                   // this.settings.ggg = 'ggg';
                    start(this.user);
                    break;
            }

            this.state = 1;
        } else {
            console.log('can\'t start process twice');
        }
    }

    stop() {
        this.state = 0;
    }

    pause(){
        this.state = 2;
    }
}

module.exports = Process;