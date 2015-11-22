var ProxyGrid = require('../../models/grid/proxy').ProxyGrid;
var utils = require('../../modules/utils');
var async = require('async');
var request = require('request');


const STATUSES = ['Проверяется', 'Не проверен', 'Неверный прокси', 'Валидный', 'Невалидный'];

var checkProxy = function (host, port, options, callback) {
    var proxyRequest = request.defaults({
        proxy: 'http://' + host + ':' + port
    });
    proxyRequest(options.url, function (err, res) {
        var testText = 'content="Yelp"';
        if (err) {
            callback(host, port, false, -1, err);
        } else if (res.statusCode != 200) {
            callback(host, port, false, res.statusCode, err);
            // } else if( !res.body || (options.regex && !options.regex.exec(res.body)) ) {
            // callback(host, port, false, res.statusCode, "Body doesn't match the regex " + options.regex + ".");
        } else {
            callback(host, port, true, res.statusCode);
        }
    });
};


var validateProxy = function (process, settings, callback) {

    var username = 'huyax';

    ProxyGrid.find({
        username: username
    }, function (err, docs) {

        async.eachSeries(docs, function (item, done) {
            if (process.getState()) {

                callback(null, {
                    type: 'gridRowEvent',
                    id: item._id,
                    columns: ['status'],
                    values: [STATUSES[0]]
                });

                if (!utils.validateIPaddress(item.content)) {


                    item.status = 2;

                    item.save(function (err) {
                        if (err) {
                            return done(err);
                        } else {

                            callback(null, {
                                type: 'gridRowEvent',
                                id: item._id,
                                columns: ['status'],
                                values: [STATUSES[2]]
                            });

                            return done();
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
                                    return done(err);
                                } else {

                                    callback(null, {
                                        type: 'gridRowEvent',
                                        id: item._id,
                                        columns: ['status'],
                                        values: [STATUSES[3]]
                                    });

                                    return done();
                                }
                            });



                        } else {

                            item.status = 4;

                            item.save(function (err) {
                                if (err) {
                                    return done(err);
                                } else {

                                    callback(null, {
                                        type: 'gridRowEvent',
                                        id: item._id,
                                        columns: ['status'],
                                        values: [STATUSES[4]]
                                    });

                                    return done();
                                }
                            });
                        }
                    })
                }
            } else {
                callback(null, {
                    type: 'eventMsg',
                    value: 'Выполнение'
                });

                //TODO:
            }
        }, function (err) {
            if (err) {
                return callback(err);
            }
            return callback(null, {
                done: true
            })
        })

    })
};


module.exports = validateProxy;