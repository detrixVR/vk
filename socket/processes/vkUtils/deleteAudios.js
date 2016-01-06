//var getAlbums = require('./getAlbums');
var processDohuya = require('./processDohuya');
var getItems = require('./getItems');
var utils = require('../../../modules/utils');
var async = require('async');

var deleteAudios = function (options, processes, credentials, callback, next) {

    callback(null, { // process msg
        cbType: 1,
        msg: utils.createMsg({msg: 'Удаление аудиозаписей'})
    });

    async.waterfall([
        function (yop) {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Получаем альбомы'})
            });
            //getAlbums('audio', options, processes, credentials, callback, function (err, albums) {
            getItems('audioAlbum', options, processes, credentials, callback, function (err, albums) {
                if (err) {
                    return yop(err);
                } else {
                    return yop(null, albums);
                }
            })
        },
        function (albums, yop) {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Удаляем альбомы'})
            });
            processDohuya(albums, 'album', 'audio', options, processes, credentials, callback, function (err) {
                if (err) {
                    return yop(err);
                } else {
                    return yop();
                }
            })
        },
        function (yop) {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Получаем аудиозаписи'})
            });
            getItems('audio', options, processes, credentials, callback, function (err, audios) {
                if (err) {
                    return yop(err);
                } else {
                    return yop(null, audios);
                }
            })
        },
        function (audios, yop) {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Удаляем аудиозаписи'})
            });
            processDohuya(audios, 'audio', 'audio', options, processes, credentials, callback, function (err) {
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
                msg: utils.createMsg({msg: 'Все видеозаписи удалены'})
            });
            return next();
        }
    });
};

module.exports = deleteAudios;