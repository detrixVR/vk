var processDohuya = require('./processDohuya');
var getItems = require('./getItems');
var utils = require('../../../modules/utils');
var async = require('async');


var deleteDocs = function (options, processes, credentials, callback, next) {

    callback(null, { // process msg
        cbType: 1,
        msg: utils.createMsg({msg: 'Удаление документов'})
    });


    async.waterfall([
        function (yop) {

            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Получаем документы'})
            });

            getItems('doc', options, processes, credentials, callback, function (err, docs) {
                if (err) {
                    return yop(err);
                } else {
                    return yop(null, docs);
                }
            });
        },
        function (docs, yop) {

            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Удаляем документы'})
            });

            processDohuya(docs, 'docs', 'docs', options, processes, credentials, callback, function (err) {
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
                msg: utils.createMsg({msg: 'Все документы удалены'})
            });
            return next();
        }
    });
};

module.exports = deleteDocs;
