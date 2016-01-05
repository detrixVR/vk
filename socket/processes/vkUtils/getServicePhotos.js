var async = require('async');

var getServicePhotos = function (accountId, token, serviceAlbum, callback) {
    async.waterfall([function (callback) {
        executeCommand(token, 'photos.get', {
            owner_id: accountId,
            album_id: serviceAlbum,
            count: 10
        }, function (err, data) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, data);
            }
        });
    }, function (data, callback) {
        if (data.result && data.result.response) {
            var count = data.result.response.count;
            var photos = data.result.response.items;
            var offset = 10;
            if (offset < count) {
                async.forever(function (next) {
                    executeCommand(token, 'photos.get', {
                        owner_id: accountId,
                        album_id: serviceAlbum,
                        count: 10,
                        offset: offset
                    }, function (err, data) {
                        if (err) {
                            return next(err);
                        } else {
                            photos = photos.concat(data.result.response.items);
                            offset += 10;
                            if (offset >= count) {
                                return next({next: true, photos: photos});
                            }
                            return next();
                        }
                    });

                }, function (err) {
                    if (err.next) {
                        return callback(null, err.photos);
                    } else {
                        return callback(err);
                    }
                });
            } else {
                return callback(null, photos);
            }
        } else {
            return callback({error: 'error'});
        }
    }], function (err, photos) {
        if (err) {
            return callback(err);
        } else {
            return callback(null, photos);
        }
    });
};

module.exports = getServicePhotos;