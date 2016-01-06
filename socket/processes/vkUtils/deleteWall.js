var processDohuya = require('./processDohuya');
var getItems = require('./getItems');
var deleteMessages = require('./deleteMessages');
var utils = require('../../../modules/utils');
var async = require('async');

var deleteWall = function (options, processes, credentials, callback, next) {
    callback(null, { // process msg
        cbType: 1,
        msg: utils.createMsg({msg: 'Удаление записей со стены'})
    });

    async.waterfall([
        function (yop) {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Получаем записи'})
            });
            getItems('wall', options, processes, credentials, callback, function (err, posts) {
                if (err) {
                    return yop(err);
                } else {
                    return yop(null, posts);
                }
            })
        },
        function (posts, yop) {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Удаляем записи'})
            });
            processDohuya(posts, 'post', 'post', options, processes, credentials, callback, function (err) {
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
                msg: utils.createMsg({msg: 'Стена очищена'})
            });
            return next();
        }
    });
};

module.exports = deleteWall;