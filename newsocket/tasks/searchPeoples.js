"use strict";

var utils = require('modules/utils'),
    async = require('async'),
    extend = require('extend'),
    dbUtils = require('modules/dbUtils'),
    config = require('config'),
    justExecuteCommand = require('vkapi').justExecuteCommand;

var searchPeoples = function (Task, callback) {

    console.log('task in searchPeoples');

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

                    let listName = Task.settings.personGrid.value.listName || 'Основной';

                    dbUtils.clearList('person', utils.extend({}, {
                        username: Task.username,
                        accountId: Task.accountId
                    }, {listName: listName}), function (err) {
                        return iteration(err ? err : null, account);
                    });

                    break;
                case 1:
                //break;
                case 2:
                //break;
                default :
                    return iteration(null, account);
            }
        }, function (account, iteration) {

            Task.pushMesssage(utils.createMsg({msg: 'Поиск людей'}));

            var options = {
                token: account.token,
                proxy: account.proxy,
                command: 'execute'
            };

            var inOptions = {
                q: Task.settings.q.value,
                sort: +Task.settings.sort.value,
                offset: +Task.settings.offset.value,
                count: 100/*+Task.settings.count.value*/,
                country: +Task.settings.country.value + 1,
                city: Task.settings.city.value ? Task.settings.city.value.id : '',
                hometown: '',
                sex: +Task.settings.sex.value,
                status: +Task.settings.status.value,
                age_from: +Task.settings.age_from.value,
                age_to: +Task.settings.age_to.value,
                interests: Task.settings.interests.value,
                online: Task.settings.online.value ? 1 : 0,
                has_photo: Task.settings.has_photo.value ? 1 : 0,
                from_list: Task.settings.from_list.value ? 'friends' : '',
                fields: config.get('vk:person:fields')
            };

            var result = [];

            function processItem(callback) {

                options.options = {
                    code: `var response = API.users.search(${JSON.stringify(inOptions)});
                                var peoples = response.items;
                                var i = 0;
                                var check1 = [];
                                if (${ Task.settings.canWritePrivateMsg.value }) {
                                    while(i < peoples.length) {
                                         if(peoples[i].can_write_private_message == 1) {
                                            check1.push(peoples[i]);
                                         }
                                         i=i+1;
                                    }
                                } else {
                                    check1 = peoples;
                                }
                                var i = 0;
                                var check2 = [];
                                if (${ Task.settings.canPost.value }) {
                                    while(i < check1.length) {
                                         if(check1[i].can_post == 1) {
                                            check2.push(check1[i]);
                                         }
                                         i=i+1;
                                    }
                                } else {
                                    check2 = check1;
                                }
                                var i = 0;
                                var check3 = [];
                                if (${ Task.settings.canSendFriendRequest.value }) {
                                    while(i < check2.length) {
                                         if(check2[i].can_send_friend_request == 1) {
                                            check3.push(check2[i]);
                                         }
                                         i=i+1;
                                    }
                                } else {
                                    check3 = check2;
                                }
                                return {
                                    count: response.count,
                                    items: check3
                                };`
                };

                justExecuteCommand(options, function (err, data) {

                    console.log(err);

                    if (err) {
                        return callback(err);
                    } else {
                        if (data &&
                            data.result &&
                            data.result.response &&
                            data.result.response.items) {

                            result = result.concat(data.result.response.items);

                            if (inOptions.offset >= data.result.response.count ||
                                result.length >= +Task.settings.count.value ||
                                inOptions.offset >= 1000) {

                                result.splice(+Task.settings.count.value);

                                Task.pushMesssage(utils.createMsg({
                                    msg: `Завершено, найдено ${result.length} людей`,
                                    type: 2
                                }));

                                return callback({success: 'success'});
                            } else {

                                return callback();
                            }

                        } else {
                            return callback({error: 'error'});
                        }
                    }
                });

                inOptions.offset += +Task.settings.count.value;
            }

            async.forever(function (next) {

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
                                    processItem(function (err) {
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
                        processItem(function (err) {
                            return next(err ? err : null);
                        })
                }

            }, function (err) {

                switch (err.arg) {
                    case 5:
                        console.log('!here');
                        console.log(err);
                        err.msg = utils.createMsg({msg: err.msg, type: 3});
                        return iteration(err);

                }

                Task.pushMesssage(utils.createMsg({msg: 'Сохранение результатов'}));

                dbUtils.saveToDbListItems('person', result, Task.settings, {
                    username: Task.username,
                    accountId: Task.accountId
                }, function (error) {

                    Task.sendEvent(extend({
                        eventName: 'reloadGrid'
                    }, {gridId: 'personGrid'}));

                    return iteration(error ? error : err);

                });

            });


        }], function (err) {

        return callback(err ? err : null, {
            cbType: 0
        })

    });
};

module.exports = searchPeoples;