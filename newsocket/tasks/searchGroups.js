"use strict";

var utils = require('modules/utils'),
    async = require('async'),
    extend = require('extend'),
    dbUtils = require('modules/dbUtils'),
    justExecuteCommand = require('vkapi').justExecuteCommand;


var searchGroups = function (Task, callback) {

    console.log('task in searchGroups');

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

                    let listName = Task.settings.groupGrid.value.listName || 'Основной';

                    dbUtils.clearList('group', utils.extend({}, {
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

            Task.pushMesssage(utils.createMsg({msg: 'Поиск групп'}));

            var options = {
                token: account.token,
                proxy: account.proxy,
                command: 'execute'
            };

            var groupType = null;

            switch (Task.settings.type.value) {
                case 0:
                    groupType = 'group';
                    break;
                case 1:
                    groupType = 'page';
                    break;
                case 2:
                    groupType = 'event';
                    break;
            }

            var step = 100;

            if (Task.settings.isCanComment.value) {
                step = 20;
            }

            var inOptions = {
                q: Task.settings.q.value,
                type: groupType,
                country_id: +Task.settings.country.value + 1,
                city_id: Task.settings.city.value ? settings.city.value.id : 0,
                future: Task.settings.isFuture.value ? 1 : 0,
                offset: +Task.settings.offset.value,
                count: step
            };

            var result = [];

            function processItem(callback) {

                options.options = {
                    code: `var response = API.groups.search(${JSON.stringify(inOptions)});
                                    var searchResult = response.items;
                                if ( response@.id ) {
                                    var groups = API.groups.getById({"group_ids": searchResult@.id, "fields":"city,country,wall_comments,members_count,counters,can_post,can_see_all_posts,activity,fixed_post,verified,ban_info"});
                                    var i = 0;
                                    var check1 = [];
                                    if (${Task.settings.isCanPost.value}){
                                        while(i < groups.length) {
                                            if (groups[i].can_post) {
                                                if(groups[i].can_post == 1) {
                                                    check1.push(groups[i]);
                                                }
                                            }
                                            i=i+1;
                                        }
                                    } else {
                                        check1 = groups;
                                    }
                                    i = 0;
                                    var check2 = [];
                                    if (${Task.settings.isOpenWall.value}){
                                        while(i < check1.length) {
                                            if (check1[i].can_see_all_posts) {
                                                if(check1[i].can_see_all_posts == 1) {
                                                    check2.push(check1[i]);
                                                }
                                            }
                                            i=i+1;
                                        }
                                    } else {
                                        check2 = check1;
                                    }
                                    i = 0;
                                    var check3 = [];
                                    if (${Task.settings.isOpened.value}){
                                        while(i < check2.length) {
                                            if (!check2[i].is_closed) {
                                                if(check2[i].is_closed == 0) {
                                                    check3.push(check2[i]);
                                                }
                                            }
                                            i=i+1;
                                        }
                                    } else {
                                        check3 = check2;
                                    }
                                    i = 0;
                                    var check4 = [];
                                    if (${Task.settings.isOfficial.value}){
                                        while(i < check3.length) {
                                            if(!check3[i].verified) {
                                                if(check3[i].verified == 0) {
                                                    check4.push(check3[i]);
                                                }
                                            }
                                            i=i+1;
                                        }
                                    } else {
                                        check4 = check3;
                                    }
                                    i = 0;
                                    var check5 = [];
                                    while(i < check4.length) {
                                        if(check4[i].members_count) {
                                            if(check4[i].members_count > ${Task.settings.minMembersCount.value}) {
                                                check5.push(check4[i]);
                                            }
                                        }
                                        i=i+1;
                                    }
                                    i = 0;
                                    var check6 = [];
                                    if (${Task.settings.isCanComment.value}){
                                        while(i < check5.length) {
                                            var post = API.wall.get({"owner_id": -check5[i].id,"count":1,"offset":0});
                                            if (post.items.length) {
                                                if (post.items[0].comments.can_post == 1) {
                                                    var gg = check5[i];
                                                    gg.wall_comments = 1;
                                                    check6.push(gg);
                                                }
                                            }
                                            i=i+1;
                                        }
                                    } else {
                                        check6 = check5;
                                    }
                                    return {
                                        count: response.count,
                                        items: check6
                                    };
                                } else {
                                    return {
                                        count: 0,
                                        items: []
                                    };
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
                                    msg: `Завершено, найдено ${result.length} групп`,
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

                inOptions.offset += step;
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

                                    return next({error: 'error'});
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

                dbUtils.saveToDbListItems('group', result, Task.settings, {
                    username: Task.username,
                    accountId: Task.accountId
                }, function (error) {

                    Task.sendEvent(extend({
                        eventName: 'reloadGrid'
                    }, {gridId: 'groupGrid'}));

                    return iteration(error ? error : err);

                });

            });


        }], function (err) {

        return callback(err ? err : null, {
            cbType: 0
        })

    });
};

module.exports = searchGroups;