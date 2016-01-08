"use strict";


var utils = require('../../modules/utils'),
    async = require('async'),
    extend = require('extend');

var PersonGrid = require('../../models/grid/person').PersonGrid;
var GroupGrid = require('../../models/grid/group').GroupGrid;
var PostGrid = require('../../models/grid/post').PostGrid;
var PhotoGrid = require('../../models/grid/photo').PhotoGrid;
var VideoGrid = require('../../models/grid/video').VideoGrid;

var executeCommand = require('../../vkapi').executeCommand;

var validationModel = {
    fromLatest: {
        name: 'Таймаут',
        validate: function (value) {
            return false;
        }
    },
    exactSelector: {
        name: 'Количество',
        validate: function (value) {
            return false;
        }
    },
    fromSelector: {
        name: 'Страна',
        validate: function (value) {
            return false;
        }
    },
    onlyOwner: {
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
    targetSelect: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    whatSelector: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    queryString: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    }
};

var listCreating = function (processes, credentials, settings, callback) {

    callback(null, { //start process
        cbType: 2,
        msg: utils.createMsg({msg: 'listCreating', type: 2, clear: true})
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

                    var Requester = null;

                    switch (settings.whatSelector.value) {
                        case 0:
                            Requester = PostGrid;
                            break;
                        case 1:
                            Requester = PhotoGrid;
                            break;
                        case 2:
                            Requester = VideoGrid;
                            break;
                        default:
                            return iteration({error: 'error'});
                    }

                    Requester.remove({
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
                    msg: utils.createMsg({msg: 'zagruzka itemov'})
                });


                var Requester = null;
                var gridOpts = null;

                switch (settings.fromSelector.value) {
                    case 0:
                        Requester = PersonGrid;
                        gridOpts = settings.personGrid.value;
                        break;
                    case 1:
                        Requester = GroupGrid;
                        gridOpts = settings.groupGrid.value;
                        break;
                    default:
                        return iteration({error: 'error'});
                }

                switch (settings.targetSelect.value) {
                    case 0:
                        Requester.find({
                            username: credentials.username,
                            accountId: credentials.accountId
                        }, function (err, docs) {
                            return iteration(err ? err : null, docs, account);
                        });
                        break;
                    case 1:
                        Requester.find({
                            username: credentials.username,
                            accountId: credentials.accountId,
                            content: {"$regex": gridOpts.searchPhrase, "$options": "i"}
                        }).sort(gridOpts.sort).skip((gridOpts.current - 1) * gridOpts.rowCount).limit(gridOpts.rowCount > 0 ? gridOpts.rowCount : 0).exec(function (err, docs) {
                            return callback(err ? err : null, docs, account);
                        });
                        break;
                    case 2:
                        Requester.find({
                            username: credentials.username,
                            accountId: credentials.accountId,
                            _id: {$in: gridOpts.selectedRows}
                        }, function (err, docs) {
                            return iteration(err ? err : null, docs, account);
                        });
                        break;
                    default:
                        return iteration(null, [], account);

                }
            }, function (items, account, iteration) {

                callback(null, { // process msg
                    cbType: 1,
                    msg: utils.createMsg({msg: 'listCreating'})
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
                                owner_id: item.id
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
                        msg: utils.createMsg({msg: 'sohranenie resultatov'})
                    });

                    var Requester = null;
                    var gridId = null;

                    switch (settings.whatSelector.value) {
                        case 0:
                            Requester = PostGrid;
                            gridId = 'postGrid';
                            break;
                        case 1:
                            Requester = PhotoGrid;
                            gridId = 'photoGrid';
                            break;
                        case 2:
                            Requester = VideoGrid;
                            gridId = 'videoGrid';
                            break;
                        default:
                            return iteration({error: 'error'});
                    }

                    async.each(result, function (item, yes) {


                        item.username = credentials.username;
                        item.accountId = credentials.accountId;

                        var newRequester = new Requester(item);

                        newRequester.save(function (err) {
                            return yes(err ? err : null);
                        });

                    }, function (error) {

                        callback(null, { // process msg
                            cbType: 5,
                            gridId: gridId
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

module.exports = listCreating;