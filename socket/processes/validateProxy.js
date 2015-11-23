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
    });//.setMaxListeners(0);
    proxyRequest(options.url, function (err, res) {
        var testText = 'content="Yelp"';
        if (err) {
            return callback(host, port, false, -1, err);
        } else if (res.statusCode != 200) {
            return callback(host, port, false, res.statusCode, err);
            // } else if( !res.body || (options.regex && !options.regex.exec(res.body)) ) {
            // callback(host, port, false, res.statusCode, "Body doesn't match the regex " + options.regex + ".");
        } else {
            return callback(host, port, true, res.statusCode);
        }
    }).setMaxListeners(0);
};


var validateProxy = function (process, settings, callback) {

    var username = 'huyax';

    ProxyGrid.find({
        username: username
    }, function (err, docs) {

        async.eachSeries(docs, function (item, done) {
            console.log(item);
            if (process.getState()) {

                callback(null, {
                    type: 'gridRowEvent',
                    id: item._id,
                    columns: ['status'],
                    values: [0]
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
                                values: [2]
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
                                        values: [3]
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
                                        values: [4]
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
                type: 'done'
            })
        })

    })
};


module.exports = validateProxy;