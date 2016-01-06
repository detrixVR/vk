var utils = require('../../../modules/utils');
var async = require('async');
var processDohuya = require('./processDohuya');
var getItems = require('./getItems');

var unsubscribeAll = function (options, processes, credentials, callback, next) {

    callback(null, { // process msg
        cbType: 1,
        msg: utils.createMsg({msg: 'Отписка от всех'})
    });

    async.waterfall([
        function (yop) {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Получаем запросы'})
            });
            getItems('subscribersOut', options, processes, credentials, callback, function (err, subscribers) {
                if (err) {
                    return yop(err);
                } else {
                    return yop(null, subscribers);
                }
            })
        }, function (subscribers, yop) {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Удаляем запросы'})
            });
            processDohuya(subscribers, 'subscriber', 'subscriber', options, processes, credentials, callback, function (err) {
                if (err) {
                    return yop(err);
                } else {
                    return yop();
                }
            })
        }
    ], function (err) {
        if (err) {
            return next(err);
        } else {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Отписались от всех'})
            });
            return next();
        }
    });
};

module.exports = unsubscribeAll;