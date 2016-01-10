"use strict";
var extend = require('extend');
var dbTask = require('../models/task').Task;


class Task {

    constructor(sio, data) {
        this.sio = sio;
        this.room = sio.getUserNameString(data);
        this.username = data.username;
        this.accountId = data.accountId;
        this.settings = data.settings;
        this.uid = data.uid;
        this.messages = [];
        this.state = 0;
    }


    start() {

        switch (this.getState()) {
            case 0:
                var that = this;


                this.interval = setInterval(function(){

                    var state = that.getState();

                    switch(state) {
                        case 1:
                            console.log('working');
                            break;
                        case 2:
                            console.log('paused');
                            break;
                        case 0:
                            console.log('stoped');
                            clearInterval(that.interval);

                            that.save(function(err){
                                console.log('saved');
                            });
                            break;
                    }
                },1000);

                this.state = 1;


                break;
            case 2:
                this.state = 1;
                break;
            case 1:
                this.pause();
                break;
        }

        this.sendState();
    }

    pause() {
        this.state = 2;

        this.sendState();
    }

    sendState() {
        this.sio.s.sockets.in(this.room).emit('setTaskState', {
            state: this.getState(),
            uid: this.uid
        });
    }

    stop() {
        this.state = 0;

        this.sendState();
    }

    getState() {
        return this.state;
    }

    save(callback) {
        var newTask = dbTask({
            username: this.username,
            accountId: this.accountId,
            messages: this.messages || [],
            settings: this.settings,
            state: this.getState(),
            uid: this.uid
        });
        newTask.save(function (err) {
            return callback(err ? err : null)
        });
    }
}

module.exports = Task;