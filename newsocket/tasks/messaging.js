"use strict";

var utils = require('modules/utils'),
    async = require('async'),
    extend = require('extend'),
    dbUtils = require('modules/dbUtils'),
    config = require('config'),
    justExecuteCommand = require('vkapi').justExecuteCommand;

function processLoop(account, callback) {

    let options = {
        token: account.token,
        proxy: account.proxy,
        command: 'execute',
        options: {}
    };


    async.waterfall([function (iteration) {

        1453744863

        console.log('getDialogs');

        let rand = utils.getRandomInt(0, 5);

        options.command = 'messages.get';
        options = {
            code: `var response = messages.getDialogs({
                    count: 1,
                    unread: 1
                });
                return {
                    count: response.count,
                    items: response.items
                };`
        }


    }, function (iteration) {

    }], function (err) {

    });

}

var messaging = function (Task, callback) {


    async.waterfall([function (iteration) {

        dbUtils.getAccountByCredentials({
            username: Task.username,
            accountId: Task.accountId
        }, function (err, account) {
            /*if (err) {
             return iteration(err);
             } else if (account) {
             if (!account.proxy || !account.token) {
             return iteration({
             msg: utils.createMsg({msg: 'Akkaunt ne proveren', type: 1})
             })
             } else {
             return iteration(null, account);
             }
             } else {
             return iteration({
             msg: utils.createMsg({msg: 'Akkaunt ne nayden', type: 1})
             })
             }*/
            return iteration(null, {
                token: 'c8d7eee470f0fe3714263ab5083f462959c40399f17ebcaed9a0e1d5d41a04f755aa458243721a9ef0feb',
                proxy: null
            })
        })

    }, function (account, iteration) {

        async.forever(function (done) {

            let state = Task.getState();

            switch (state) {
                case 0:
                    break;
                case 2:
                    Task.pushMesssage(utils.createMsg({msg: 'Пауза'}));

                    let d = null;
                    var delay = function () {

                        state = Task.getState();

                        if (state === 2) {
                            d = setTimeout(delay, 100);
                        } else {
                            clearTimeout(d);
                            if (state !== 0) {
                                processLoop(account, function (err) {
                                    return done(err ? err : null);
                                });
                            } else {

                                Task.pushMesssage(utils.createMsg({msg: 'Выполнение прервано'}));

                                return done({error: 'error'});
                            }
                        }
                    };
                    delay();
                    break;
                default:
                    processLoop(account, function (err) {
                        return done(err ? err : null);
                    })
            }

        }, function (err) {

            return iteration(err);
        })

    }], function (err) {

        return callback(err ? err : null, {
            cbType: 0
        })

    });


};


module.exports = messaging;
