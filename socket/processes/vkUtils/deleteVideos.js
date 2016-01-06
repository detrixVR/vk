//var getAlbums = require('./getAlbums');
var processDohuya = require('./processDohuya');
var getItems = require('./getItems');
var utils = require('../../../modules/utils');
var async = require('async');

var deleteVideos = function (options, processes, credentials, callback, next) {

    callback(null, { // process msg
        cbType: 1,
        msg: utils.createMsg({msg: 'Удаление видеозаписей'})
    });

    async.waterfall([
        function (yop) {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Получаем альбомы'})
            });
            // getAlbums('video',options, processes, credentials, callback, function (err, albums) {
            getItems('videoAlbum', options, processes, credentials, callback, function (err, albums) {
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
                msg: utils.createMsg({msg: 'Удаление albomov'})
            });
            processDohuya(albums, 'album', 'video', options, processes, credentials, callback, function (err) {
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
                msg: utils.createMsg({msg: 'Получаем видеозаписи'})
            });
            getItems('video', options, processes, credentials, callback, function (err, videos) {
                if (err) {
                    return yop(err);
                } else {
                    return yop(null, videos);
                }
            })
        },
        function (videos, yop) {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Удаляем видеозаписи'})
            });
            processDohuya(videos, 'video', 'video', options, processes, credentials, callback, function (err) {
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

module.exports = deleteVideos;