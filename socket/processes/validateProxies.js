var ProxyGrid = require('../../models/grid/proxy').ProxyGrid,
    utils = require('../../modules/utils'),
    async = require('async'),
    request = require('request'),
    getForGrid = require('../../router/grid').getForGrid,
    extend = require('extend');

const STATUSES = ['Проверяется', 'Не проверен', 'Неверный прокси', 'Валидный', 'Невалидный', 'Удален'];

var checkProxy = function (host, port, options, callback) {
    var proxyRequest = request.defaults({
        proxy: 'http://' + host + ':' + port,
        timeout: 1500
    });
    proxyRequest(options.url, function (err, res) {
        if (err) {
            return callback(host, port, false, -1, err);
        } else if (res.statusCode != 200) {
            return callback(host, port, false, res.statusCode, err);
        } else {
            return callback(host, port, true, res.statusCode);
        }
    }).setMaxListeners(0);
};

var validationModel = {
    deleteIfWrong: {
        validate: function (value) {
            return false;
        }
    },
    proxyGrid: {
        validate: function (value) {
            return false;
        }
    },
    targetSelector: {
        validate: function (value) {
            return false;
        }
    },
    timeoutInput: {
        name: 'Таймаут',
        validate: function (value) {
            if (!utils.isInt(value) || value < 0 || value > 5) {
                return 'Должно быть числом от 0 до 5'
            }
        }
    },
    urlInput: {
        name: 'Адрес проверки',
        validate: function (value) {
            if (!utils.validateURL(value)) {
                return 'Неверный формат адреса'
            }
        }
    }
};

var validateProxies = function (processes, credentials, settings, callback) {

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

    callback(null, { // process msg
        cbType: 1,
        msg: utils.createMsg({msg: 'Проверка прокси', clear: true})
    });

    async.waterfall([function (callback) {
        switch (settings.targetSelector.value) {
            case 0:
                ProxyGrid.find({
                    username: credentials.username
                }, function (err, docs) {
                    return callback(err ? err : null, docs);
                });
                break;
            case 1:
                var options = settings.proxyGrid.value;
                getForGrid(ProxyGrid, extend({}, credentials, options), function (err, docs) {
                    return callback(err ? err : null, docs);
                });
                break;
            case 2:
                ProxyGrid.find({
                    username: credentials.username,
                    _id: {$in: settings.proxyGrid.value.selectedRows}
                }, function (err, docs) {
                    return callback(err ? err : null, docs);
                });
                break;
            default:
                return callback(null, []);

        }
    }, function (proxies, next) {


        async.eachSeries(proxies, function (item, done) {

            var processItem = function (item, back) {

                callback(null, {
                    cbType: 4,
                    id: item._id,
                    columns: ['status'],
                    values: [0],
                    msg: utils.createMsg({msg: `Проверяется ${item.content}`, type: 0})
                });

                if (!utils.validateIPaddress(item.content)) {

                    item.status = 2;

                    item.save(function (err) {
                        if (err) {
                            return back(err);
                        } else {

                            callback(null, {
                                cbType: 4,
                                id: item._id,
                                columns: ['status'],
                                values: [2],
                                msg: utils.createMsg({msg: `${item.content} - неверный формат прокси`, type: 1})
                            });

                            return back();
                        }
                    });
                } else {
                    var arr = item.content.split(':');

                    checkProxy(arr[0], arr[1], {
                        url: settings.urlInput.value,
                        timeout: settings.timeoutInput.value * 1000
                    }, function (host, port, ok, statusCode, err) {
                        if (ok) {

                            item.status = 3;

                            item.save(function (err) {
                                if (err) {
                                    return back(err);
                                } else {

                                    callback(null, {
                                        cbType: 4,
                                        id: item._id,
                                        columns: ['status'],
                                        values: [3],
                                        msg: utils.createMsg({msg: `${item.content} - Валидный`, type: 2})
                                    });

                                    return back();
                                }
                            });


                        } else {

                            item.status = 4;

                            if (settings.deleteIfWrong.value) {

                                item.remove(function (err) {
                                    if (err) {
                                        return back(err);
                                    } else {

                                        callback(null, {
                                            cbType: 4,
                                            id: item._id,
                                            columns: ['status'],
                                            values: [5],
                                            msg: utils.createMsg({
                                                msg: `${item.content} - Невалидный (удален)`,
                                                type: 3
                                            })
                                        });

                                        return back();
                                    }
                                });
                            } else {
                                item.save(function (err) {
                                    if (err) {
                                        return back(err);
                                    } else {

                                        callback(null, {
                                            cbType: 4,
                                            id: item._id,
                                            columns: ['status'],
                                            values: [4],
                                            msg: utils.createMsg({msg: `${item.content} - Невалидный`, type: 3})
                                        });

                                        return back();
                                    }
                                });
                            }


                        }
                    })
                }

            };

            var curState = utils.getProcessState(processes, credentials);

            switch (curState) {
                case 1:
                    processItem(item, function (err) {
                        return done(err ? err : null);
                    });
                    break;
                case 2:

                    callback(null, {
                        cbType: 3,
                        msg: utils.createMsg({msg: 'Пауза'})
                    });

                    var d = null;
                    var delay = function () {

                        curState = utils.getProcessState(processes, credentials);

                        if (curState === 2) {
                            d = setTimeout(delay, 100);
                        } else {
                            clearTimeout(d);
                            if (curState !== 0) {
                                processItem(item, function (err) {
                                    return done(err ? err : null);
                                });
                            } else {
                                return done({
                                    msg: utils.createMsg({msg: 'Процесс был прерван', type: 1})
                                });
                            }
                        }
                    };
                    delay();
                    break;
                case 0:
                    return done({
                        msg: utils.createMsg({msg: 'Процесс был прерван', type: 1})
                    });
                default :
                    return done();
            }
        }, function (err) {
            return next(err ? err : null);
        })
    }], function (err) {
        console.log(err);
        return callback(null, {
            cbType: 0,
            msg: err ? err.msg ? err.msg : utils.createMsg({msg: 'Проверка завершена'}) : utils.createMsg({msg: 'Проверка завершена'})
        })
    });
};

module.exports = validateProxies;