(function () {

    "use strict";

    let intel = require('intel'),
        dbInstance = require('models/instance'),
        _ = require('underscore'),
        Hub = require('cluster-hub'),
        async = require('async'),
        Instance = require('Instance');

    var hub = new Hub();

    let init = function (msg) {

        let sn = msg.data;

        dbInstance.findOne({sn: sn}, function (err, doc) {
            if (err) {
                intel.error(err);

                throw new Error('Init error');
            } else if (doc) {

                let newInstance = new Instance(doc);
                newInstance.init(function (err) {
                    if (err) {
                        intel.error(err);
                    } else {
                        GLOBAL.Instance = newInstance;
                        process.send({
                            command: 'instanceReady', data: {
                                sn: newInstance.sn,
                                accounts: _.map(newInstance.accounts, function (account) {
                                    return {
                                        uid: account.uid,
                                        tasks: _.map(account, function (task) {
                                            return task.uid;
                                        })
                                    }
                                })
                            }
                        });
                    }
                });
            } else {
                let newInstance = new Instance({
                    sn: sn
                });

                newInstance.init(function (err) {
                    if (err) {
                        intel.error(err);
                    } else {
                        GLOBAL.Instance = newInstance;
                        process.send({
                            command: 'instanceReady', data: {
                                sn: newInstance.sn,
                                accounts: []
                            }
                        });
                    }
                });
            }
        });
    };

    let memoryUsage = function (msg) {
        process.send({
            command: 'setMemoryUsage',
            data: {
                processPid: process.pid,
                memoryUsage: process.memoryUsage(),
                accounts: _.map(GLOBAL.Instance.accounts, function (account) {
                    return {
                        uid: account.uid,
                        username: account.username,
                        accountId: account.accountId,
                        tasks: _.map(account.tasks, function (task) {
                            return {
                                uid: task.uid,
                                taskName: task.taskName
                            }
                        })
                    }
                })
            }
        });
    };

    let sendMemoryUsage = function (msg) {
        //  GLOBAL.Instance.Socket && GLOBAL.Instance.Socket.sendMemoryUsage(msg.data);
    };

    let shutdown = function (msg) {

        GLOBAL.Instance.save(function (err) {
            intel.error(err);
            process.send({command: 'canKill'});
        });

    };

    let getCurrentTask = function (msg) {
        // console.log(msg.data.username + ':' + msg.data.accountId + ':' + msg.data.pageId);
        let room = msg.data.username + ':' + msg.data.accountId + ':' + msg.data.pageId;
        if (msg.data && msg.data.account && msg.data.task) { // uids: { instance, account, task }
            let account = GLOBAL.Instance.getAccountByUid(msg.data.account.uid);
            if (account) {
                account.getCurrentTask(msg.data.task, function (err, task) {
                    if (err) {
                        intel.error(err);
                    } else {
                        GLOBAL.Instance.Socket.s.sockets.in(room).emit('setCurrentTask', task);
                    }
                });
            } else {
                intel.error('Не найден аккаунт при поиске существующего таска')
            }
        } else {
            GLOBAL.Instance.Socket.s.sockets.in(room).emit('setCurrentTask', null);
        }
    };

    let setStatistic = function (statistic) {
        GLOBAL.Instance.Socket.s.sockets.in('huyax:10000000:adminPanel').emit('setStatistic', statistic);
    };

    let getStatistic = function () {

        let self = GLOBAL.Instance;

        process.send({
            command: 'setStatistic',
            data: {
                processPid: process.pid,
                memoryUsage: process.memoryUsage(),
                accounts: _.map(self.accounts, function (account) {
                    return {
                        uid: account.uid,
                        username: account.username,
                        accountId: account.accountId,
                        tasks: _.map(account.tasks, function (task) {
                            return {
                                uid: task.uid,
                                pageId: task.pageId
                            }
                        })
                    }
                })
            }
        });
    };


  /*  process.on('message', function (data) {

        intel.debug(`${process.pid}: command: ${data.command}`);

        eval(data.command)(data);

    });*/


    hub.on('init', function (data, sender, callback) {

        let sn = data;

        async.waterfall([
            function (callback) {
                return dbInstance.findOne({sn: sn}, callback);
            }, function (doc, callback) {
                let newInstance = new Instance(doc || {
                        sn: sn
                    });
                newInstance.init(function (err) {
                    if (err) {
                        return callback(err);
                    } else {
                        GLOBAL.Instance = newInstance;
                        return callback(null, {
                            sn: newInstance.sn,
                            accounts: _.map(newInstance.accounts, function (account) {
                                return {
                                    uid: account.uid,
                                    tasks: _.map(account, function (task) {
                                        return task.uid;
                                    })
                                }
                            })
                        });
                    }
                });
            }
        ], callback);
    })

})();
