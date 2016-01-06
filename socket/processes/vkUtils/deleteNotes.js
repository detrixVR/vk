var processDohuya = require('./processDohuya');
var getItems = require('./getItems');
var utils = require('../../../modules/utils');
var async = require('async');

var deleteNotes = function (options, processes, credentials, callback, next) {
    callback(null, { // process msg
        cbType: 1,
        msg: utils.createMsg({msg: 'Удаление заметок'})
    });
    async.waterfall([
        function (yop) {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Получаем заметки'})
            });
            getItems('note', options, processes, credentials, callback, function (err, notes) {
                if (err) {
                    return yop(err);
                } else {
                    return yop(null, notes);
                }
            })
        },
        function (notes, yop) {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Удаляем заметки'})
            });
            processDohuya(notes, 'note', 'note', options, processes, credentials, callback, function (err) {
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
                msg: utils.createMsg({msg: 'Все заметки удалены'})
            });
            return next();
        }
    });
};

module.exports = deleteNotes;