"use strict";

var PersonGrid = require('../../models/grid/person').PersonGrid,
    utils = require('../../modules/utils'),
    async = require('async'),
    request = require('request'),
    extend = require('extend'),
    dbUtils = require('../../modules/dbUtils'),
    validationModel = require('./settings').searchPeoples,
    executeCommand = require('../../vkapi').executeCommand;



var searchPeoples = function (processes, credentials, settings, callback) {

    callback(null, { //start process
        cbType: 2,
        msg: utils.createMsg({msg: 'Поиск людей', type: 2, clear: true})
    });

    var error = utils.validateSettings(settings, validationModel);

    if (error) {
        return callback(null, {
            cbType: 0,
            msg: utils.createMsg({msg: error.msg, clear: true, type: 1}),
            badFields: error.badFields
        })
    }

    async.waterfall([
            function (iteration) {

                callback(null, { // process msg
                    cbType: 1,
                    msg: utils.createMsg({msg: 'Загрузка аккаунта'})
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

                switch (settings.replaceSelector.value) {
                    case 0:

                        callback(null, { // process msg
                            cbType: 1,
                            msg: utils.createMsg({msg: 'Очистка списка'})
                        });

                        var listName = settings.personGrid.value.listName || 'Основной';

                        dbUtils.clearList('person', utils.extend({}, credentials, {listName: listName}), function (err) {
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

                callback(null, { // process msg
                    cbType: 1,
                    msg: utils.createMsg({msg: 'Поиск людей'})
                });

                var options = {
                    token: account.token,
                    proxy: account.proxy,
                    command: 'execute'
                };



                var inOptions = {
                    q: settings.q.value,
                    sort: +settings.sort.value,
                    offset: +settings.offset.value,
                    count: 100/*+settings.count.value*/,
                    country: +settings.country.value + 1,
                    city: settings.city.value ? settings.city.value.id : '',
                    hometown: '',
                    sex: +settings.sex.value,
                    status: +settings.status.value,
                    age_from: +settings.age_from.value,
                    age_to: +settings.age_to.value,
                    interests: settings.interests.value,
                    online: settings.online.value ? 1 : 0,
                    has_photo: settings.has_photo.value ? 1 : 0,
                    from_list: settings.from_list.value ? 'friends' : '',
                    fields: `sex,bdate,can_post,verified,domain,nickname,relation,can_see_all_posts,can_see_audio,can_write_private_message,can_send_friend_request,wall_comments,blacklisted,blacklisted_by_me,photo_50`
                };

                console.log(inOptions);


                var result = [];

                async.forever(function (next) {


                    options.options = {
                        code: `var response = API.users.search(${JSON.stringify(inOptions)});
                                var peoples = response.items;
                                var i = 0;
                                var check1 = [];
                                if (${ settings.canWritePrivateMsg.value }) {
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
                                if (${ settings.canPost.value }) {
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
                                if (${ settings.canSendFriendRequest.value }) {
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

                    executeCommand(options, processes, credentials, callback, function (err, data) {

                        console.log(data);
                        if (err) {
                            return next(err);
                        } else {
                            if (data &&
                                data.result &&
                                data.result.response &&
                                data.result.response.items) {

                                result = result.concat(data.result.response.items);

                                if (inOptions.offset >= data.result.response.count ||
                                    result.length >= +settings.count.value ||
                                    inOptions.offset >= 1000) {

                                    result.splice(+settings.count.value);

                                    return next({
                                        msg: utils.createMsg({
                                            msg: `Завершено, найдено ${result.length} пользователей`,
                                            type: 2
                                        })
                                    });
                                } else {
                                    return next();
                                }

                            } else {
                                return next({
                                    msg: utils.createMsg({msg: 'Ошибка'})
                                });
                            }
                        }
                    });

                    inOptions.offset += +settings.count.value;


                }, function (err) {

                    switch (err.arg) {
                        case 5:
                            console.log('!here');
                            console.log(err);
                            err.msg = utils.createMsg({msg: err.msg, type: 3});
                            return iteration(err);

                    }

                   // console.log(result);


                    callback(null, {
                        cbType: 1,
                        msg: utils.createMsg({msg: 'Сохранение результатов'})
                    });


                    dbUtils.saveToDbListItems('person', result, settings, credentials, function (error) {

                        callback(null, { // process msg
                            cbType: 5,
                            gridId: 'personGrid'
                        });

                        return iteration(error ? error : err);

                    });

                });


            }
        ],
        function (err) {
            return callback(null, {
                cbType: 0,
                msg: err ? err.msg ? err.msg : utils.createMsg({msg: 'Проверка завершена'}) : utils.createMsg({msg: 'Проверка завершена'})
            })
        }
    );
};

module.exports = searchPeoples;