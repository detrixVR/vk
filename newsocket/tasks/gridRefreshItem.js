"use strict";

var utils = require('modules/utils');
var justExecuteCommand = require('vkapi').justExecuteCommand;
var dbUtils = require('modules/dbUtils');
var extend = require('extend');
var config = require('config');

var async = require('async');

var gridRefreshItem1 = function (task, callback) {

    console.log('task in');

    var interval = setInterval(function () {

        var state = Task.getState();

        switch (state) {
            case 1:
                console.log('working');
                Task.pushMesssage(utils.createMsg({msg: 'working'}));
                break;
            case 2:
                console.log('paused');
                Task.pushMesssage(utils.createMsg({msg: 'paused'}));
                break;
            case 0:
                console.log('stoped');

                clearInterval(interval);

                return callback(null, {
                    cbType: 0
                });
        }
    }, 1000);

};

var gridRefreshItem = function (Task, callback) {

    console.log('task in gridRefreshItem');

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

        var options = {
            token: account.token,
            proxy: account.proxy,
            command: 'execute',
            options: {}
        };

        function processItem(item, callback) {

            Task.pushMesssage(utils.createMsg({msg: 'Обновление элемента'}));

            switch (Task.settings.listType.value) {
                case 'post':

                    options.command = 'wall.getById';
                    options.options = {
                        posts: item.value.owner_id + '_' + item.value.id
                    };

                    break;
                case 'person':

                    options.command = 'users.get';
                    options.options = {
                        user_ids: item.value.id,
                        fields: config.get('vk:person:fields')
                    };

                    break;
                default:
                    return callback(new Error({name: 'HUYAXERROR', message: 'Тип списка не задан'}));
            }

            justExecuteCommand(options, function (err, data) {
                if (err) {
                    return callback(err);
                } else if (data &&
                    data.result &&
                    data.result.response) {

                    if (data.result.response.length) {

                        dbUtils.getItemFromDbById(Task.settings.listType.value, item._id, function (err, dbItem) {
                            if (err) {
                                return callback(err);
                            } else if (dbItem && dbItem.value) {

                                extend(dbItem.value, data.result.response[0]);

                                console.log(data.result.response[0]);

                                dbItem.markModified('value');

                                Task.pushMesssage(utils.createMsg({msg: 'Сохранение элемента'}));

                                dbItem.save(function (err, newItem) {

                                    if (err) {
                                        return callback(err);
                                    } else {

                                        Task.sendEvent(extend({
                                            eventName: 'refreshRow'
                                        }, newItem));

                                        return callback();
                                    }


                                })

                            } else {
                                return callback({error: 'error'});
                            }
                        });
                    } else {
                        console.error('Нет результатов');

                        dbUtils.removeItemFromDbById(Task.settings.listType.value, item._id, function (err) {
                            if (err) {
                                return callback(err);
                            } else {
                                Task.pushMesssage(utils.createMsg({msg: 'Запись не найдена'}));

                                Task.sendEvent(extend({
                                    eventName: 'disableRow'
                                }, {_id: item._id}));

                                return callback();
                            }
                        });
                    }
                } else {
                    return callback({error: 'error'});
                }
            });
        }

        async.eachSeries(Task.settings.items.value, function (item, done) {

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
                                processItem(item, function (err) {
                                    return done(err ? err : null);
                                });
                            } else {

                                Task.pushMesssage(utils.createMsg({msg: 'Выполнение прервано'}));

                                return next({error: 'error'});
                            }
                        }
                    };
                    delay();
                    break;
                default:
                    processItem(item, function (err) {
                        return done(err ? err : null);
                    })
            }

        }, function (err) {
            return iteration(err);
        });

    }], function (err) {

        return callback(err ? err : null, {
            cbType: 0
        })
    });
};

module.exports = gridRefreshItem;