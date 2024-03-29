(function () {

    "use strict";

    let intel = require('intel'),
        dbInstance = require('models/instance'),
        _ = require('underscore'),
        Hub = require('cluster-hub'),
        async = require('async'),
        Instance = require('Instance');

    var hub = new Hub();

    GLOBAL.hub = hub;

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

    hub.on('stopTask', function (data, sender, callback) {
        return GLOBAL.Instance.stopTask(data);
    });

    hub.on('startPauseTask', function (data, sender, callback) {
        return GLOBAL.Instance.startPauseTask(data);
    });

    hub.on('getCurrentTask', function (data, sender, callback) {
        let account = GLOBAL.Instance.getAccountByCredentials(data);
        if (account) {
            let task = account._getTaskByPageId(data);
            console.log('send');
            GLOBAL.Instance.Socket.s.sockets.in(`${data.username}:${data.accountId}:${data.pageId}`).emit('setCurrentTask', task);
        }
    });

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
