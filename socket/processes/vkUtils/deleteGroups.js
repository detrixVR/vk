var utils = require('../../../modules/utils');
var async = require('async');
var processDohuya = require('./processDohuya');
var getItems = require('./getItems');

var deleteGroups = function (options, processes, credentials, callback, next) {

    callback(null, { // process msg
        cbType: 1,
        msg: utils.createMsg({msg: 'Выход из групп'})
    });

    async.waterfall([
        function (yop) {

            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Получаем группы'})
            });

            getItems('group', options, processes, credentials, callback, function (err, groups) {
                if (err) {
                    return yop(err);
                } else {
                    return yop(null, groups);
                }
            })
        },
        function (groups, yop) {

            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Выходим из групп'})
            });

            processDohuya(groups, 'group', 'group', options, processes, credentials, callback, function (err) {
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
                msg: utils.createMsg({msg: 'Успешно вышли из групп'})
            });

            return next();
        }
    });
};

module.exports = deleteGroups;