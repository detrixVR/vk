var processDohuya = require('./processDohuya');
var getItems = require('./getItems');
var utils = require('../../../modules/utils');
var async = require('async');

var deleteFriends = function (options, processes, credentials, callback, next) {
    callback(null, { // process msg
        cbType: 1,
        msg: utils.createMsg({msg: 'Удаление друзей'})
    });
    async.waterfall([
        function (yop) {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Получаем друзей'})
            });
            getItems('friend', options, processes, credentials, callback, function (err, friends) {
                if (err) {
                    return yop(err);
                } else {
                    return yop(null, friends);
                }
            })
        },
        function (friends, yop) {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Удаляем друзей'})
            });
            processDohuya(friends, 'friend', 'friend', options, processes, credentials, callback, function (err) {
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
                msg: utils.createMsg({msg: 'Все друзья удалены'})
            });
            return next();
        }
    });
};

module.exports = deleteFriends;