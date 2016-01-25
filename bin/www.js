"use strict";

var path = require('path');

require('app-module-path').addPath(path.join(__dirname, '../'));

var cluster = require('cluster'),
    extend = require('extend'),
    express = require('express'),
    app = require('app'),
    server = require('http').createServer(app),
    Socket = require('newsocket/Classes/Socket'),
    uuid = require('node-uuid'),
    utils = require('modules/utils'),
    _ = require('underscore'),
    util = require('util');

var workers = /*process.env.WORKERS*/3 || require('os').cpus().length; //WEB_CONCURRENCY

var workersArray = [];
var accounts = [];
var memoryUsage = {};

if (cluster.isMaster) {

    console.log(__dirname);

    console.log('Start cluster with %s workers', workers - 1);

    let broadcast = function (data) {
        for (var i in workersArray) {
            var worker = workersArray[i];
            worker.send(data);
        }
    };

    let getExistingTaskAccount = function (uid) {
        var account = null;

        for (var k = 0; k < accounts.length; k++) {
            for (var i = 0; i < accounts[k].tasks.length; i++) {
                if (accounts[k].tasks[i].uid === uid) {
                    account = accounts[k];
                    break;
                }
            }
        }

        return account;
    };

    let getExistingAccount = function (data) {
        console.log('getExistingAccount');
        var account = null;

        for (var k = 0; k < accounts.length; k++) {
            if (accounts[k].username === data.username &&
                accounts[k].accountId === data.accountId) {
                account = accounts[k];
                break;
            }
        }

        return account;
    };

    let createTask = function (data, command) {
        let account = getExistingAccount(data);
        if (account) {

            let uid = uuid.v1();

            let task = {
                taskName: data.taskName + '_' + uid,
                uid: uid
            };

            account.tasks.push(task);

            console.log(account.uid)

            cluster.workers[account.wid].send({
                command: command,
                data: extend({}, data, task, {account: {uid: account.uid}})
            });
        }
    };

    workers--;

    for (var i = 0; i < workers; ++i) {

        var worker = cluster.fork();

        worker.on('message', function (msg) {

            let account = null;

            switch (msg.command) {
                case 'getMemoryUsage':
                    this.send({
                        command: 'sendMemoryUsage',
                        data: memoryUsage
                    });
                    break;
                case 'setMemoryUsage':
                    var oldMemoryUsage = extend({}, memoryUsage);

                    memoryUsage[msg.data.processPid] = {
                        memory: msg.data.memoryUsage.heapTotal,
                        accounts: msg.data.accounts
                    };

                    if (!_.isEqual(oldMemoryUsage, memoryUsage)) {
                        this.send({
                            command: 'sendMemoryUsage',
                            data: memoryUsage
                        })
                    }

                    break;
                case 'getAllTasks':
                    broadcast({
                        command: 'getAllTasks',
                        data: msg.data
                    });
                    break;
                case 'switchAccount':
                    account = getExistingAccount(msg.data);
                    if (!account) {

                        let newAccount = extend({}, msg.data, {
                            wid: this.id,
                            uid: uuid.v1(),
                            tasks: []
                        });

                        accounts.push(newAccount);

                        this.send({
                            command: 'addAccount',
                            data: newAccount
                        });
                    }
                    break;
                case 'getCurrentTask':
                    account = getExistingAccount(msg.data);
                    if (account) {
                        cluster.workers[account.wid].send({
                            command: msg.command,
                            data: extend({}, msg.data, {account: {uid: account.uid}})
                        });
                    } else {
                        this.send({
                            command: msg.command,
                            data: extend({}, msg.data, {account: {uid: account.uid}})
                        });
                    }
                    console.log(msg.data);
                    break;
                case 'createTask':
                    createTask(msg.data, msg.command);
                    break;
                case 'startPauseTask':
                    if (!msg.data.uid) {
                        createTask(msg.data, msg.command);
                    } else {
                        account = getExistingTaskAccount(msg.data.uid);
                        if (account) {
                            cluster.workers[account.wid].send({
                                command: msg.command,
                                data: msg.data
                            });
                        }
                    }
                    break;
                case 'stopTask':
                    account = getExistingTaskAccount(msg.data.uid);
                    if (account) {
                        cluster.workers[account.wid].send({
                            command: msg.command,
                            data: msg.data
                        });
                    }
                    break;
            }
        });
        workersArray.push(worker);
    }

    cluster.on('death', function (worker) {
        console.log('worker %s died. restart...', worker.process.pid);
        cluster.fork();
    });

    setInterval(function () {
        for (var i = 0; i < workersArray.length; i++) {
            workersArray[i].send({
                command: 'memoryUsage'
            });
        }
    }, 2000);

} else {

    let onError = function (error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        var bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    };

    let onListening = function () {
        var addr = server.address();
        var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        console.log('Listening on ' + bind);
    };

    let normalizePort = function (val) {
        var port = parseInt(val, 10);

        if (isNaN(port)) {
            return val;
        }

        if (port >= 0) {
            return port;
        }

        return false;
    };

    var port = normalizePort(process.env.PORT || '5000');

    app.set('port', port);

    server.listen(port);

    server.on('error', onError);
    server.on('listening', onListening);

    app.set('hovan', (new Socket(server)).init());
}



