var PersonGrid = require('../../models/grid/person').PersonGrid,
    utils = require('../../modules/utils'),
    async = require('async'),
    request = require('request'),
    extend = require('extend'),
    executeCommand = require('../../vkapi').executeCommand;

const STATUSES = ['Проверяется', 'Не проверен', 'Неверный прокси', 'Валидный', 'Невалидный', 'Удален'];

var validationModel = {
    age_from: {
        validate: function (value) {
            return false;
        }
    },
    age_to: {
        validate: function (value) {
            return false;
        }
    },
    canWritePrivateMsg: {
        validate: function (value) {
            return false;
        }
    },
    city: {
        name: 'Таймаут',
        validate: function (value) {
            return false;
        }
    },
    count: {
        name: 'Количество',
        validate: function (value) {
            return false;
        }
    },
    country: {
        name: 'Страна',
        validate: function (value) {
            return false;
        }
    },
    from_list: {
        name: 'Поиск среди друзей',
        validate: function (value) {
            return false;
        }
    },
    has_photo: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    interests: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    offset: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    online: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    q: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    personGrid: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    replaceSelector: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    sort: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    status: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    }
};

var searchPeoples = function (processes, credentials, settings, callback) {

    callback(null, { //start process
        cbType: 2
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

    async.waterfall([function (iteration) {

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

        callback(null, { // process msg
            cbType: 1,
            msg: utils.createMsg({msg: 'Poisk lyudey'})
        });


        var options = {
            token: account.token,
            proxy: account.proxy,
            command: 'users.search'
        };

        var inOptions = {
            q: settings.q.value,
            sort: +settings.sort.value,
            offset: +settings.offset.value,
            count: +settings.count.value,
            country: +settings.count.value + 1,
            city: +settings.city.value + 1,
            hometown: '',
            sex: +settings.sex.value,
            status: +settings.status.value + 1,
            age_from: +settings.age_from.value,
            age_to: +settings.age_to.value,
            interests: settings.interests.value,
            online: settings.online.value ? 1 : 0,
            has_photo: settings.has_photo.value ? 1 : 0,
            from_list: settings.from_list.value ? 'friends' : '',
            fields: 'sex,online,can_write_private_message'
        };


        var result = [];

        async.forever(function (next) {
            if (result.length >= +settings.count.value ||
                inOptions.offset >= 1000) {
                return next({
                    result: result,
                    msg: utils.createMsg({msg: 'done'})
                });
            } else {

                options.code = `var peoples = API.users.search(${JSON.stringify(inOptions)}).items;
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
                    return check1;`;

                executeCommand(options, function (err, data) {
                    // console.log(err);
                    // console.log(data);
                    if (err) {
                        return next(err);
                    } else {
                        if (data &&
                            data.result &&
                            data.result.response &&
                            data.result.response.items &&
                            data.result.response.items.length) {
                            result = result.concat(data.result.response.items);
                            next();
                        } else {
                            return next({
                                result: result,
                                msg: utils.createMsg({msg: 'oshibka'})
                            });
                        }
                    }
                });
                inOptions.offset += +settings.count.value;
            }
        }, function (err) {

            console.log(err.result);

            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'sohranenie resultatov'})
            });

            async.each(err.result, function (item, yes) {


                item.username = credentials.username;

                console.log(item);
                var newPersonGrid = new PersonGrid(item);

                newPersonGrid.save(function (err) {
                    return yes(err ? err : null);
                });

            }, function (err) {

                callback(null, { // process msg
                    cbType: 5,
                    gridId: 'personGrid'
                });

                return iteration(err);

            });


        });


    }], function (err) {
        return callback(null, {
            cbType: 0,
            msg: err ? err.msg ? err.msg : utils.createMsg({msg: 'Проверка завершена'}) : utils.createMsg({msg: 'Проверка завершена'})
        })
    });
};

module.exports = searchPeoples;