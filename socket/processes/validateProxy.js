var ProxyGrid = require('../../models/grid/proxy').ProxyGrid,
    utils = require('../../modules/utils'),
    async = require('async'),
    request = require('request'),
    getForGrid = require('../../router/grid').getForGrid;


const STATUSES = ['Проверяется', 'Не проверен', 'Неверный прокси', 'Валидный', 'Невалидный'];

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


var validateProxy = function (settings, callback) {

    callback(null, {
        cbType: 1,
        msg: utils.createMsg({msg: 'Проверка прокси', clear: true})
    });

    var username = 'huyax';
    var that = this;

    console.log(settings);
    async.waterfall([function (callback) {
        switch (settings.targetSelect.value) {
            case 0:
                ProxyGrid.find({
                    username: username
                }, function (err, docs) {
                    return callback(err ? err : null, docs);
                });
                break;
            case 1:
                settings.proxyGrid.value.username = username;
                getForGrid(ProxyGrid, settings.proxyGrid.value, function (err, docs) {
                    return callback(err ? err : null, docs);
                });
                break;
            case 2:
                ProxyGrid.find({
                    username: username,
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
                        url: 'http://vk.com',
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
                    })
                }

            };

            switch (that.state.state) {
                case 1:
                    processItem(item, function (err) {
                        return done(err ? err : null);
                    });
                    break;
                case 2:

                    callback(null, {
                        cbType: 2,
                        msg: utils.createMsg({msg: 'Пауза'})
                    });

                    var d = null;
                    var delay = function () {
                        console.log('delay');
                        if (that.state.state === 2) {
                            d = setTimeout(delay, 100);
                        } else {
                            clearTimeout(d);
                            if (that.state.state !== 0) {
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


module.exports = validateProxy;