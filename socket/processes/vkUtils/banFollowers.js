var utils = require('../../../modules/utils');
var async = require('async');
var processDohuya = require('./processDohuya');
var getItems = require('./getItems');

var banFollowers = function (options, processes, credentials, callback, next) {

    callback(null, { // process msg
        cbType: 1,
        msg: utils.createMsg({msg: 'Получение подписчиков'})
    });

    async.waterfall([
        function (yop) {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Получаем подписчиков'})
            });
            getItems('follower',options, processes, credentials, callback, function (err, followers) {
                if (err) {
                    return yop(err);
                } else {
                    return yop(null, followers);
                }
            })
        }, function (followers, yop) {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Баним подписчиков'})
            });
            processDohuya(followers, 'follower', 'follower',options, processes, credentials, callback, function (err) {
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
                msg: utils.createMsg({msg: 'Все подписчики забанены'})
            });
            return next();
        }
    });
};

module.exports = banFollowers;