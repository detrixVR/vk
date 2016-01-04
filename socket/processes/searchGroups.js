"use strict";

var GroupGrid = require('../../models/grid/group').GroupGrid,
    utils = require('../../modules/utils'),
    async = require('async'),
    request = require('request'),
    extend = require('extend'),
    executeCommand = require('../../vkapi').executeCommand;

var validationModel = {
    city: {
        name: 'Таймаут',
        validate: function (value) {
            return false;
        }
    },
    count: {
        name: 'Количество',
        validate: function (value) {
            if (!utils.isInt(value) || +value > 1000) {
                return 'Должно быть числомdo 1000'
            }
            return false;
        }
    },
    country: {
        name: 'Страна',
        validate: function (value) {
            return false;
        }
    },
    offset: {
        name: 'Адрес проверки',
        validate: function (value) {
            if (!utils.isInt(value) || +value > 1000) {
                return 'Должно быть числомdo 1000'
            }
            return false;
        }
    },
    q: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    groupGrid: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },

    type: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    isOpened: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    isOpenWall: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    isCanPost: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    isCanComment: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    isOfficial: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    isFuture: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    minMembersCount: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    }
};

var searchGroups = function (processes, credentials, settings, callback) {

    callback(null, { //start process
        cbType: 2,
        msg: utils.createMsg({msg: 'Poisk grupp', type: 2, clear: true})

    });

    var error = utils.validateSettings(settings, validationModel);

    if (error) {
        return callback(null, {
            cbType: 0,
            msg: utils.createMsg({msg: error.msg, clear: true, type: 1}),
            badFields: error.badFields
        })
    }

    //console.log('here');

    async.waterfall([
            function (iteration) {

                callback(null, { // process msg
                    cbType: 1,
                    msg: utils.createMsg({msg: 'zagruzka akkaunta'})
                });

                utils.getAccountByCredentials(credentials, function (err, account) {
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
                if (!settings.replaceSelector.value) {

                    callback(null, { // process msg
                        cbType: 1,
                        msg: utils.createMsg({msg: 'Ochistka spiska'})
                    });

                    GroupGrid.remove({
                        username: credentials.username,
                        accountId: credentials.accountId
                    }, function (err) {
                        return iteration(err ? err : null, account);
                    });

                } else {
                    return iteration(null, account);
                }
            }, function (account, iteration) {

                callback(null, { // process msg
                    cbType: 1,
                    msg: utils.createMsg({msg: 'Poisk lyudey'})
                });


                var options = {
                    token: account.token,
                    proxy: account.proxy,
                    command: 'execute'
                };

                var groupType = null;


                switch (settings.type.value) {
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

                if (settings.isCanComment.value) {
                    step = 20;
                }

                var inOptions = {
                    q: settings.q.value,
                    type: groupType,
                    country_id: +settings.country.value + 1,
                    city_id: settings.city.value ? settings.city.value.id : 0,
                    future: settings.isFuture.value ? 1 : 0,
                    offset: +settings.offset.value,
                    count: step
                };

                var result = [];
                //   let init = false;

                async.forever(function (next) {

                    function processItem(back) {

                        if (result.length >= +settings.count.value ||
                            inOptions.offset >= 1000) {
                            return back({
                                msg: utils.createMsg({msg: 'done'})
                            });
                        } else {

                            options.options = {
                                code: `var searchResult = API.groups.search(${JSON.stringify(inOptions)}).items;
                                if ( searchResult@.id ) {
                                    var groups = API.groups.getById({"group_ids": searchResult@.id, "fields":"city,country,wall_comments,members_count,counters,can_post,can_see_all_posts,activity,fixed_post,verified,ban_info"});
                                    var i = 0;
                                    var check1 = [];
                                    if (${settings.isCanPost.value}){
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
                                    if (${settings.isOpenWall.value}){
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
                                    if (${settings.isOpened.value}){
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
                                    if (${settings.isOfficial.value}){
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
                                            if(check4[i].members_count > ${settings.minMembersCount.value}) {
                                                check5.push(check4[i]);
                                            }
                                        }
                                        i=i+1;
                                    }
                                    i = 0;
                                    var check6 = [];
                                    if (${settings.isCanComment.value}){
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
                                    return check6;
                                } else {
                                    return [];
                                };`
                            };

                            executeCommand(options, function (err, data) {
                                if (err) {
                                    return back(err);
                                } else {
                                    if (data &&
                                        data.result &&
                                        data.result.response) {
                                        result = result.concat(data.result.response);
                                        back();
                                    } else {
                                        return back({
                                            msg: utils.createMsg({msg: 'oshibka'})
                                        });
                                    }
                                }
                            });
                            inOptions.offset += step;
                        }
                    }

                    var curState = utils.getProcessState(processes, credentials);

                    switch (curState) {
                        case 1:

                            setTimeout(function () {
                                console.log('inn')
                                processItem(function (err) {
                                    return next(err ? err : null);
                                });
                            }, 333);

                            break;
                        case 2:

                            callback(null, {
                                cbType: 3,
                                msg: utils.createMsg({msg: utils.createMsg({msg: 'Пауза'})})
                            });


                            var d = null;
                            var delay = function () {

                                curState = utils.getProcessState(processes, credentials);

                                if (curState === 2) {
                                    d = setTimeout(delay, 100);
                                } else {
                                    clearTimeout(d);
                                    if (curState !== 0) {

                                        callback(null, { //start process
                                            cbType: 2
                                        });

                                        processItem(function (err) {
                                            return next(err ? err : null);
                                        });
                                    } else {
                                        return next({
                                            msg: utils.createMsg({msg: 'Процесс был прерван', type: 2})
                                        });
                                    }
                                }
                            };
                            delay();
                            break;
                        case 0:

                            return next({
                                msg: utils.createMsg({msg: 'Процесс был прерван', type: 2})
                            });
                        default :
                            return next();
                    }

                }, function (err) {

                    switch (err.arg) {
                        case 5:
                            console.log('!here');
                            console.log(err);
                            err.msg = utils.createMsg({msg: err.msg, type: 3});
                            return iteration(err);

                    }


                    callback(null, {
                        cbType: 1,
                        msg: utils.createMsg({msg: 'sohranenie resultatov'})
                    });

                    async.each(result, function (item, yes) {


                        item.username = credentials.username;
                        item.accountId = credentials.accountId;

                        var newGroupGrid = new GroupGrid(item);

                        newGroupGrid.save(function (err) {
                            return yes(err ? err : null);
                        });

                    }, function (error) {

                        callback(null, { // process msg
                            cbType: 5,
                            gridId: 'groupGrid'
                        });

                        return iteration(error ? error : err);

                    });


                });


            }],
        function (err) {

            return callback(null, {
                cbType: 0,
                msg: err ? err.msg ? err.msg : utils.createMsg({msg: 'Проверка завершена'}) : utils.createMsg({msg: 'Проверка завершена'})
            })
        });
};

module.exports = searchGroups;