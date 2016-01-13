"use strict";


var utils = require('../../../modules/utils'),
    async = require('async'),
    validationModel = require('../settings').listCreatingFromPerson,
    dbUtils = require('../../../modules/dbUtils'),
    extend = require('extend');


var executeCommand = require('../../../vkapi').executeCommand;


var listCreatingFromPerson = function (processes, credentials, settings, callback) {

    callback(null, { //start process
        cbType: 2,
        msg: utils.createMsg({msg: 'Создание списка', type: 2, clear: true})
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


                callback(null, { // process msg
                    cbType: 1,
                    msg: utils.createMsg({msg: 'Загрузка айтемов'})
                });


                dbUtils.getFromDbBySettings('person', settings, credentials, function (err, items) {
                    return iteration(err ? err : null, items, account);
                })


            }, function (items, account, iteration) {

                console.log('items');
                console.log(items);

                callback(null, { // process msg
                    cbType: 1,
                    msg: utils.createMsg({msg: 'Создание списка'})
                });


                var options = {
                    token: account.token,
                    proxy: account.proxy,
                    command: 'execute'
                };

                var result = [];

                async.eachSeries(items, function (item, done) {

                    console.log(item);

                    switch (settings.whatSelector.value) {
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
                                    return done({error: 'error'});

                            }

                            executeCommand(options, processes, credentials, callback, function (err, data) {

                                console.log(data);
                                console.log(err);
                                if (err) {
                                    return done(err);
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

                                    return done();

                                } else {
                                    return done({error: 'error'});
                                }
                            });


                            break;
                        case 1:
                            break;
                        case 2:
                            break;
                        default:
                            return done({error: 'error'});
                    }

                    // return done();


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

                    callback(null, {
                        cbType: 1,
                        msg: utils.createMsg({msg: 'Сохранение результатов'})
                    });

                    console.log(result);

                    dbUtils.saveToDbListItems('post', result, settings, credentials, function (error) {

                        callback(null, { // process msg
                            cbType: 5,
                            gridId: 'postGrid'
                        });

                        return iteration(error ? error : err);

                    });
                })


            }
        ],
        function (err) {

            return callback(null, {
                cbType: 0,
                msg: (err && err.hasOwnProperty('msg')) ? err.msg : utils.createMsg({msg: 'Ошибка'})
            })
        }
    );
};

module.exports = listCreatingFromPerson;