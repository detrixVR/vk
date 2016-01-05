var getAlbums = require('./getAlbums');
var deleteDohuya = require('./deleteDohuya');
var getServicePhotos = require('./getServicePhotos');
var utils = require('../../../modules/utils');
var async = require('async');


var deletePhotos = function (options, processes, credentials,  callback, next) {

    callback(null, { // process msg
        cbType: 1,
        msg: utils.createMsg({msg: 'Удаление фотографий'})
    });


    async.waterfall([function (yop) {

        callback(null, { // process msg
            cbType: 1,
            msg: utils.createMsg({msg: 'Получаем альбомы'})
        });

        getAlbums('photo', options, processes, credentials, callback, function (err, albums) {
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

        deleteDohuya(accountId, token, albums, 'album', 'photo', function (err) {
            if (err) {
                return yop(err);
            } else {
                return v();
            }
        })
    }, function (yop) {

        callback(null, { // process msg
            cbType: 1,
            msg: utils.createMsg({msg: 'Получаем фото со стены'})
        });

        getServicePhotos(accountId, token, 'wall', function (err, photos) {
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

        deleteDohuya(accountId, token, photos, 'photo', 'photo', function (err) {
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

        getServicePhotos(accountId, token, 'profile', function (err, photos) {
            if (err) {
                return yop(err);
            } else {
                return v(null, photos);
            }
        })
    }, function (photos, yop) {

        callback(null, { // process msg
            cbType: 1,
            msg: utils.createMsg({msg: 'Удаляем фото со страницы'})
        });

        deleteDohuya(accountId, token, photos, 'photo', 'photo', function (err) {
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

        getServicePhotos(accountId, token, 'saved', function (err, photos) {
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

        deleteDohuya(accountId, token, photos, 'photo', 'photo', function (err) {
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