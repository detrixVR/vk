
var async = require('async');

var deleteDohuya = function (command, options, callback) {


    async.waterfall([function (callback) {
        executeCommand(command, options, function (err, data) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, data);
            }
        });
    }, function (data, callback) {
        if (data.result && data.result.response) {
            var count = data.result.response.count;
            var result = data.result.response.items;
            var offset = 100;
            if (offset < count) {
                async.forever(function (next) {
                    executeCommand(token, command, {
                        owner_id: accountId,
                        count: 100,
                        offset: offset
                    }, function (err, data) {
                        if (err) {
                            return next(err);
                        } else {
                            result = result.concat(data.result.response.items);
                            offset += 100;
                            if (offset >= count) {
                                return next({next: true, result: result});
                            }
                            return next();
                        }
                    });

                }, function (err) {
                    if (err.next) {
                        return callback(null, err.result);
                    } else {
                        return callback(err);
                    }
                });
            } else {
                return callback(null, result);
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

module.exprots = deleteDohuya;

