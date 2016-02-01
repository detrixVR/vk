(function () {

    "use strict";

    let intel = require('intel'),
        dbInstance = require('models/instance'),
        _ = require('underscore'),
        Instance = require('Instance');


    let init = function (msg) {

        let sn = msg.data;

        dbInstance.findOne({sn: sn}, function (err, doc) {
            if (err) {

            } else if (doc) {

                GLOBAL.Instance = new Instance(doc)

            } else {
                GLOBAL.Instance = new Instance({
                    sn: sn
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
        GLOBAL.Instance.Socket && GLOBAL.Instance.Socket.sendMemoryUsage(msg.data);
    };

    let shutdown = function (msg) {

        GLOBAL.Instance.save(function (err) {
            intel.error(err);
            process.send({command: 'canKill'});
        });

    };

    let error = function(){
       // throw  new Error('test');
    };


    process.on('message', function (data) {

        intel.debug(`${process.pid}: command: ${data.command}`);

        eval(data.command)(data);

    });

})();
