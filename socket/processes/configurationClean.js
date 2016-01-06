"use strict";


var utils = require('../../modules/utils'),
    async = require('async'),
    extend = require('extend'),
    deletePhotos = require('./vkUtils/deletePhotos'),
    deleteAudios = require('./vkUtils/deleteAudios'),
    deleteDocs = require('./vkUtils/deleteDocs'),
    deleteNotes = require('./vkUtils/deleteNotes'),
    deleteFriends = require('./vkUtils/deleteFriends'),
    deleteDialogs = require('./vkUtils/deleteDialogs'),
    deleteWall = require('./vkUtils/deleteWall'),
    deleteStatus = require('./vkUtils/deleteStatus'),
    deleteGroups = require('./vkUtils/deleteGroups'),
    deleteRequests = require('./vkUtils/deleteRequests'),
    banFollowers = require('./vkUtils/banFollowers'),
    unsubscribeAll = require('./vkUtils/unsubscribeAll'),
    deleteVideos = require('./vkUtils/deleteVideos');

var validationModel = {
    banFollowers: {
        name: 'Таймаут',
        validate: function (value) {
            return false;
        }
    },
    cleanStatus: {
        name: 'Количество',
        validate: function (value) {
            return false;
        }
    },
    cleanWall: {
        name: 'Страна',
        validate: function (value) {
            return false;
        }
    },
    clearProfile: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    removeAudios: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    removeDialogs: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },

    removeDocs: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    removeFriends: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    removeGroups: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    removeNotes: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    removePhotos: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    removeRequests: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    removeVideos: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    unSubscribeAll: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    }
};

var configurationClean = function (processes, credentials, settings, callback) {

    callback(null, { //start process
        cbType: 2,
        msg: utils.createMsg({msg: 'configurationClean', type: 2, clear: true})
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

                callback(null, { // process msg
                    cbType: 1,
                    msg: utils.createMsg({msg: 'configurationClean'})
                });


                var options = {
                    token: account.token,
                    proxy: account.proxy,
                    command: 'execute'
                };

                async.forEachOfSeries(settings, function (item, key, done) {


                    if (!item.value) {
                        return done();
                    }

                    switch (key) {
                        case 'removePhotos':
                            deletePhotos(options, processes, credentials, callback, function (err) {
                                return done(err ? err : null);
                            });
                            break;
                        case 'removeVideos':
                            deleteVideos(options, processes, credentials, callback, function (err) {
                                return done(err ? err : null);
                            });
                            break;
                        case 'removeAudios':
                            deleteAudios(options, processes, credentials, callback, function (err) {
                                return done(err ? err : null);
                            });
                            break;
                        case 'removeDocs':
                            deleteDocs(options, processes, credentials, callback, function (err) {
                                return done(err ? err : null);
                            });
                            break;
                        case 'removeNotes':
                            deleteNotes(options, processes, credentials, callback, function (err) {
                                return done(err ? err : null);
                            });
                            break;
                        case 'removeFriends':
                            deleteFriends(options, processes, credentials, callback, function (err) {
                                return done(err ? err : null);
                            });
                            break;
                        case 'removeDialogs':
                            deleteDialogs(options, processes, credentials, callback, function (err) {
                                return done(err ? err : null);
                            });
                            break;
                        case 'cleanWall':
                            deleteWall(options, processes, credentials, callback, function (err) {
                                return done(err ? err : null);
                            });
                            break;
                        case 'cleanStatus':
                            deleteStatus(options, processes, credentials, callback, function (err) {
                                return done(err ? err : null);
                            });
                            break;
                        case 'removeGroups':
                            deleteGroups(options, processes, credentials, callback, function (err) {
                                return done(err ? err : null);
                            });
                            break;
                        case 'removeRequests':
                            deleteRequests(options, processes, credentials, callback, function (err) {
                                return done(err ? err : null);
                            });
                            break;
                        case 'banFollowers':
                            banFollowers(options, processes, credentials, callback, function (err) {
                                return done(err ? err : null);
                            });
                            break;
                        case 'unSubscribeAll':
                            unsubscribeAll(options, processes, credentials, callback, function (err) {
                                return done(err ? err : null);
                            });
                            break;
                        /*case 'clearProfile':
                         // clearProfile(window.account, window.token, function (err) {
                         return done();//callback(err ? err : null);
                         // });
                         break;
                         */
                        default :
                            return done();
                    }

                    //  return done();


                }, function (err) {


                    return iteration(err ? err : null);
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

module.exports = configurationClean;