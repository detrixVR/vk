//var getAlbums = require('./getAlbums');
var processDohuya = require('./processDohuya');
var getServicePhotos = require('./getServicePhotos');
var getItems = require('./getItems');
var utils = require('../../../modules/utils');
var async = require('async');

var deletePhotos = function (options, processes, credentials, callback, next) {

    callback(null, { // process msg
        cbType: 1,
        msg: utils.createMsg({msg: 'Удаление фотографий'})
    });


    async.waterfall([function (yop) {

        callback(null, { // process msg
            cbType: 1,
            msg: utils.createMsg({msg: 'Получаем альбомы'})
        });

       // getAlbums('photo', options, processes, credentials, callback, function (err, albums) {
        getItems('photoAlbum', options, processes, credentials, callback, function (err, albums) {
            if (err) {
                return yop(err);
            } else {
                return yop(null, albums);
            }
        })
    }, function (albums, yop) {

        callback(null, { // process msg
            cbType: 1,
            msg: utils.createMsg({msg: 'Удаляем альбомы'})
        });

        processDohuya(albums, 'album', 'photo', options, processes, credentials, callback, function (err) {
            if (err) {
                return yop(err);
            } else {
                return yop();
            }
        })
    }, function (yop) {

        callback(null, { // process msg
            cbType: 1,
            msg: utils.createMsg({msg: 'Получаем фото со стены'})
        });

        getServicePhotos('wall', options, processes, credentials, callback, function (err, photos) {
            if (err) {
                return yop(err);
            } else {
                return yop(null, photos);
            }
        })
    }, function (photos, yop) {

        callback(null, { // process msg
            cbType: 1,
            msg: utils.createMsg({msg: 'Удаляем фото со стены'})
        });

        processDohuya(photos, 'photo', 'photo', options, processes, credentials, callback, function (err) {
            if (err) {
                return yop(err);
            } else {
                return yop();
            }
        })
    }, function (yop) {

        callback(null, { // process msg
            cbType: 1,
            msg: utils.createMsg({msg: 'Получаем фото со страницы'})
        });

        getServicePhotos('profile', options, processes, credentials, callback, function (err, photos) {
            if (err) {
                return yop(err);
            } else {
                return yop(null, photos);
            }
        })
    }, function (photos, yop) {

        callback(null, { // process msg
            cbType: 1,
            msg: utils.createMsg({msg: 'Удаляем фото со страницы'})
        });

        processDohuya(photos, 'photo', 'photo', options, processes, credentials, callback, function (err) {
            if (err) {
                return yop(err);
            } else {
                return yop();
            }
        })
    }, function (yop) {

        callback(null, { // process msg
            cbType: 1,
            msg: utils.createMsg({msg: 'Получаем сохраненные фото'})
        });

        getServicePhotos('saved', options, processes, credentials, callback, function (err, photos) {
            if (err) {
                return yop(err);
            } else {
                return yop(null, photos);
            }
        })
    }, function (photos, yop) {

        callback(null, { // process msg
            cbType: 1,
            msg: utils.createMsg({msg: 'Удаляем сохраненные фото'})
        });

        processDohuya(photos, 'photo', 'photo', options, processes, credentials, callback, function (err) {
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
                msg: utils.createMsg({msg: 'Все фотографии удалены'})
            });

            return next();
        }
    });
};

module.exports = deletePhotos;