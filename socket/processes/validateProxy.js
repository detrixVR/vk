var ProxyGrid = require('../../models/grid/proxy').ProxyGrid;
var utils = require('../../modules/utils');
var async = require('async');
var request = require('request');

//request.setMaxListeners(0);


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
        msg: this.createMsg({msg: 'Старт'})
    });


    var username = 'huyax';
    var that = this;

    ProxyGrid.find({
        username: username
    }, function (err, docs) {



        async.eachSeries(docs, function (item, done) {

            var processItem = function (item, back) {

                callback(null, {
                    cbType: 4,
                    id: item._id,
                    columns: ['status'],
                    values: [0]
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
                                values: [2]
                            });

                            return back();
                        }
                    });
                } else {
                    var arr = item.content.split(':');

                    checkProxy(arr[0], arr[1], {
                        url: 'http://vk.com'
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
                                        values: [3]
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
                                        values: [4]
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
                        msg: that.createMsg({msg: 'Пауза'})
                    });

                    var d = null;
                    var delay = function () {
                        console.log('delay');
                        if (that.state.state === 2) {
                            d = setTimeout(delay, 100);
                        } else {
                            clearTimeout(d);
                            processItem(item, function (err) {
                                return done(err ? err : null);
                            });
                        }
                    };
                    delay();
                    break;
                case 0:
                    return done(true);
                default :
                    return done();
            }
        }, function(err){

            return callback(null, {
                cbType: 0,
                msg: that.createMsg({msg: 'Стоп'})
            })
        })
    })
};


module.exports = validateProxy;