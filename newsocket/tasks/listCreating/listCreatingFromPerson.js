"use strict";

var utils = require('modules/utils'),
    async = require('async'),
    extend = require('extend'),
    dbUtils = require('modules/dbUtils'),
    config = require('config'),
    justExecuteCommand = require('vkapi').justExecuteCommand;

var listCreatingFromPerson = function (Task, callback) {

    console.log('task in listCreatingFromPerson');

    async.waterfall([
        function (iteration) {

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

            switch (Task.settings.replaceSelector.value) {
                case 0:

                    Task.pushMesssage(utils.createMsg({msg: 'Очистка списка'}));

                    let targetListType = null;
                    let targetListName = null;

                    switch (Task.settings.whatSelector.value) {
                        case 0:
                            targetListType = 'post';
                            targetListName = Task.settings.postGrid.value.listName || 'Основной';
                            break;
                        case 1:
                            targetListType = 'photo';
                            targetListName = Task.settings.photoGrid.value.listName || 'Основной';
                            break;
                        case 2:
                            targetListType = 'video';
                            targetListName = Task.settings.videoGrid.value.listName || 'Основной';
                            break;
                    }

                    dbUtils.clearList(targetListType, utils.extend({}, {
                        username: Task.username,
                        accountId: Task.accountId
                    }, {listName: targetListName}), function (err) {
                        return iteration(err ? err : null, account);
                    });

                    break;
                case 1:
                //break;
                case 2:
                //break;
                default :
                    return iteration(null, account, targetListType);
            }
        }, function (account, targetListType, iteration) {

            dbUtils.getFromDbBySettings('person', Task.settings, {
                username: Task.username,
                accountId: Task.accountId
            }, function (err, items) {
                return iteration(err ? err : null, items, account, targetListType);
            })

        }, function (items, account, targetListType, iteration) {

            Task.pushMesssage(utils.createMsg({msg: 'Создание списка'}));

            var options = {
                token: account.token,
                proxy: account.proxy,
                command: 'execute'
            };

            var result = [];

            function processItem(item, callback) {

                switch (Task.settings.whatSelector.value) {
                    case 0:

                        options.command = 'wall.get';
                        options.options = {
                            owner_id: item.value.id
                        };

                        switch (settings.exactSelector.value) {
                            case 0:
                                options.options['count'] = 1;
                                if (settings.onlyOwner.value) {
                                    options.options['filter'] = 'owner';
                                }
                                break;
                            case 1:
                                options.options['count'] = settings.fromLatest.value;
                                if (settings.onlyOwner.value) {
                                    options.options['filter'] = 'owner';
                                }
                                break;
                            case 2:
                                options.command = 'wall.search';
                                options.options['owners_only'] = (settings.onlyOwner.value ? 1 : 0);
                                options.options['count'] = 1;
                                options.options['query'] = settings.queryString.value;
                                break;
                            default:
                                return callback({error: 'error'});

                        }

                        justExecuteCommand(options, function (err, data) {

                            console.log(data);
                            console.log(err);
                            if (err) {
                                return callback(err);
                            } else if (
                                data &&
                                data.result &&
                                data.result.response &&
                                data.result.response.items) {

                                if (data.result.response.items.length) {
                                    let randowmInt = utils.getRandomInt(0, data.result.response.items.length - 1);
                                    data.result.response.items = data.result.response.items.slice(randowmInt, randowmInt + 1);
                                }

                                result = result.concat(data.result.response.items);

                                return callback();

                            } else {
                                return callback({error: 'error'});
                            }
                        });


                        break;
                    case 1:
                        break;
                    case 2:
                        break;
                    default:
                        return callback({error: 'error'});
                }
            }

            async.eachSeries(items, function (item, next) {

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
                                        return next(err ? err : null);
                                    });
                                } else {

                                    Task.pushMesssage(utils.createMsg({msg: 'Выполнение прервано'}));

                                    return callback(err ? err : null, {
                                        cbType: 0
                                    })
                                }
                            }
                        };
                        delay();
                        break;
                    default:
                        processItem(item, function (err) {
                            return next(err ? err : null);
                        })
                }

            }, function (err) {

                if (err) {

                    switch (err.arg) {
                        case 5:
                            console.log('!here');
                            console.log(err);
                            err.msg = utils.createMsg({msg: err.msg, type: 3});
                            return iteration(err);

                    }
                }

                Task.pushMesssage(utils.createMsg({msg: 'Сохранение результатов'}));

                dbUtils.saveToDbListItems(targetListType, result, Task.settings, {
                    username: Task.username,
                    accountId: Task.accountId
                }, function (error) {

                    Task.sendEvent(extend({
                        eventName: 'reloadGrid'
                    }, {gridId: targetListType + 'Grid'}));

                    return iteration(error ? error : err);

                });

            });


        }], function (err) {

        return callback(err ? err : null, {
            cbType: 0
        })

    });
};

module.exports = listCreatingFromPerson;