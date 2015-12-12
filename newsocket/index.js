var io = require('socket.io');
var redis = require('socket.io-redis');
var extend = require('extend');
var async = require('async');
var request = require('request');


var sio = function (server) {

    var s = io.listen(server);

    s.adapter(redis({host: 'localhost', port: 6379}));

    var processes = [];

    function getProcess(data) {
        var process = null;
        for (var i= 0; i < processes.length;i++) {
            if (processes[i].username == data.username &&
                processes[i].accountId == data.accountId &&
                processes[i].processId == data.processId) {

                process = processes[i];

            }
        }
        return process;
    }

    function getProcessState(data){
        var process = getProcess(data);
        var state = -1;
        if(process) {
            state = process.state;
        }
        return state;
    }

    function startPauseProcess(data){
        var process = getProcess(data);
        if (process) {
            process.state = data.state;
        }
    }

    process.on('message', function (msg) {

        switch (msg.command) {
            case 'setProcessState':
                switch (msg.data.state) {
                    case 1:
                        console.log('setState');
                        var process = getProcess(msg.data);
                        if (!process) {
                            var delay = function (data) {
                                var state = getProcessState(data);
                                console.log(state);
                                d = setTimeout(function () {
                                    delay(data);
                                }, 250);
                            };
                            delay(msg.data);
                            processes.push(msg.data);
                        } else {
                            startPauseProcess(msg.data);
                        }
                        break;
                    case 2:
                        console.log('pauseProcess');
                        startPauseProcess(msg.data);
                        break;
                }
                break;
            default:
                s.to([msg.data.socketId]).emit(msg.command, msg.data);
        }
    });

    s.sockets.on('connection', function (socket) {

        console.log('connection to ' + process.pid);

        var data = {
            username: 'huyax1',
            socketId: socket.id
        };

        process.send({
            command: 'addUser',
            data: data
        });

        socket.on('getAllUsers', function (inData) {
            process.send({
                command: 'getAllUsers',
                data: extend(data, inData)
            });
        });

        socket.on('disconnect', function () {
            process.send({
                command: 'delUser',
                data: extend(data, {})
            });
        });

        socket.on('startPauseProcess', function () {
            process.send({
                command: 'startPauseProcess',
                data: extend(data, {
                    accountId: '123',
                    processId: '456'
                })
            });
        });


    })
};


module.exports = sio;
