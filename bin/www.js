"use strict";

var path = require('path');

require('app-module-path').addPath(path.join(__dirname, '../'));

var cluster = require('cluster'),
    extend = require('extend'),
    express = require('express'),
    app = require('app'),
    server = require('http').createServer(app),
    uuid = require('node-uuid'),
    utils = require('modules/utils'),
    _ = require('underscore'),
    intel = require('intel'),
    Instance = require('Instance'),
    util = require('util');

var workers = /*process.env.WORKERS*/3 || require('os').cpus().length; //WEB_CONCURRENCY

var instances = [];
var memoryUsage = {};

let timeout = null;

if (cluster.isMaster) {

    console.log(__dirname);

    console.log('Start cluster with %s workers', workers - 1);


    let getInstance = function (data) {
        return _.find(instances, function (instance) {
            return (instance.sn === data.sn);
        })
    };

    let getAccount = function (data) {
        let instance = null;
        let account = _.find(instances, function (ins) {
            if (ins.sn === data.instanceSn) {
                instance = ins;
                return _.find(ins.accounts, function (account) {
                    return (account.uid === data.uid);
                });
            }
            return false;
        });

        return {
            instance: instance,
            account: account
        }
    };

    let getTask = function (data) {

        let instance = null;
        let account = null;
        let task = _.find(instances, function (ins) {
            if (ins.sn === data.instanceSn) {
                instance = ins;
                return _.find(ins.accounts, function (ac) {
                    if (account.uid === data.accountUid) {
                        account = ac;
                        return _.find(ac.tasks, function (task) {
                            return (task.uid === task.uid);
                        })
                    }
                    return false;
                });
            }
            return false;
        });

        return {
            instance: instance,
            account: account,
            task: task
        }
    };

    workers--;

    for (var i = 0; i < workers; ++i) {

        var worker = cluster.fork();

        worker.on('message', function (msg) {

            let account = null;

            switch (msg.command) {
                case 'instanceReady':
                {
                    let instance = getInstance(msg.data);
                    if (!instance) {
                        instances.push(msg.data);
                    } else {
                        intel.warning('Попытка добавить существующий инстанс');
                    }
                }
                    break;
                case 'accountReady':
                { //instanceSn
                    let result = getAccount(msg.data);
                    if (result.instance && !result.account) {
                        result.instance.accounts.push({
                            uid: msg.uid,
                            tasks: msg.tasks
                        });
                    } else {
                        intel.error('Невозможно добавить аккаунт');
                    }
                }
                    break;
                case 'taskReady':
                { //instanceSn, accountUid
                    let result = getTask(msg.data);
                    if (result.instance && result.account && !result.task) {
                        result.account.tasks.push({
                            uid: msg.uid
                        });
                    } else {
                        intel.error('Невозможно добавить таск');
                    }
                }
                    break;


                case 'getMemoryUsage':
                {
                    this.send({
                        command: 'sendMemoryUsage',
                        data: memoryUsage
                    });
                }
                    break;
                case 'setMemoryUsage':
                {
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
                }
                    break;
                case 'getAllTasks':
                {
                    broadcast({
                        command: 'getAllTasks',
                        data: msg.data
                    });
                }
                    break;
                case 'switchAccount':
                {
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
                }
                    break;
                case 'getCurrentTask':
                {
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
                }
                    break;
                case 'createTask':
                {
                    createTask(msg.data, msg.command);
                }
                    break;
                case 'startPauseTask':
                {
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
                }
                    break;
                case 'stopTask':
                {
                    account = getExistingTaskAccount(msg.data.uid);
                    if (account) {
                        cluster.workers[account.wid].send({
                            command: msg.command,
                            data: msg.data
                        });
                    }
                }
                    break;
                case 'canKill':
                {
                    this.kill();
                }
                    break;
            }
        }).on('listening', function (address) {
            console.log(address);
        }).on('disconnect', function () {
            console.log('disconnect');
        }).on('error', function (error) {
            console.error('PARAPAPAPAM');
            console.error(error);
        });
    }

    cluster.on('death', (worker) => {
        console.log('worker %s died. restart...', worker.process.pid);
        cluster.fork();
    }).on('online', (worker) => {
        intel.debug(`Yay, the worker responded after it was forked ${worker.id}`);

        worker.send({
            command: 'init',
            data: worker.id
        });

    });

    /*let eachWorker = function (callback) {
        for (var id in cluster.workers) {
            callback(cluster.workers[id]);
        }
    };

    setInterval(function () {
        eachWorker((worker) => {
            worker.send({
                command: 'memoryUsage'
            });
        });
    }, 2000);


    setTimeout(function () {
        // for (var i = 0; i < workersArray.length; i++) {
        cluster.workers[1].send({command: 'error'});
        // workersArray[0].send({command: 'shutdown'});
        // }
    }, 10000)*/

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

    GLOBAL.server = server.listen(port);

    server.on('error', onError);
    server.on('listening', onListening);

    require('processing');
}



