var processDohuya = require('./processDohuya');
var getItems = require('./getItems');
var deleteMessages = require('./deleteMessages');
var utils = require('../../../modules/utils');
var async = require('async');

var deleteDialogs = function (options, processes, credentials, callback, next) {
    callback(null, { // process msg
        cbType: 1,
        msg: utils.createMsg({msg: 'Удаление сообщений'})
    });
    async.waterfall([
        function (yop) {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Получаем диалоги'})
            });
            getItems('dialog', options, processes, credentials, callback, function (err, dialogs) {
                if (err) {
                    return yop(err);
                } else {
                    return yop(null, dialogs);
                }
            })
        },
        function (dialogs, yop) {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Удаляем сообщения'})
            });
            deleteMessages(dialogs, options, processes, credentials, callback, function (err) {
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
                msg: utils.createMsg({msg: 'Все сообщения удалены'})
            });
            return next();
        }
    });
};

module.exports = deleteDialogs;