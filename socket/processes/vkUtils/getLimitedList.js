var executeCommand = require('../../vkapi').executeCommand;


var getLimitedList = function (command, preCode, preOptions, postCode, limit, extended, callback) {

    var hapka = extended ? 100 : 20;
    var step = preOptions.count > hapka ? hapka : preOptions.count;

    async.waterfall([function (callback) {
        preOptions.count = step;
        var options = {
            command: command,
            token: token,
            options: {
                code: preCode + JSON.stringify(preOptions) + postCode
            }
        };
        executeCommand(options, function (err, data) {
            if (err) {
                return callback(err);
            } else if (data.result && data.result.response) {
                var resultArray = data.result.response.length ? data.result.response : data.result.response.items ? data.result.response.items : [];
                if (resultArray.length) {
                    gridAppend(resultArray, function (err) {
                        return callback(err ? err : null, resultArray);
                    });
                } else {
                    return callback(null, resultArray);
                }
            } else {
                return callback({error: 'error'});
            }
        });
    }, function (array, callback) {
        if (array.length) {
            preOptions.offset += step;
            async.forever(function (next) {
                if (preOptions.offset >= 1000 || array.length >= limit) {
                    return next({
                        next: true,
                        result: array
                    });
                } else {
                    //preOptions.count = limit - array.length > hapka ? hapka : limit - array.length;
                    var options = {code: preCode + JSON.stringify(preOptions) + postCode};
                    executeCommand(window.token, command, options, function (err, data) {
                        if (err) {
                            return next(err);
                        } else {
                            var resultArray = data.result.response.length ? data.result.response : data.result.response.items ? data.result.response.items : [];
                            if (resultArray.length) {
                                gridAppend(resultArray, function (err) {
                                    array = array.concat(resultArray);
                                    preOptions.offset += step;

                                    return next(err ? err : null);
                                });
                            } else {
                                return next({
                                    next: true,
                                    result: array
                                });
                            }
                        }
                    });
                }
            }, function (err) {
                if (err.next) {
                    return callback(null, err.result);
                } else {
                    return callback(err);
                }
            });
        } else {
            return callback(null, array);
        }
    }], function (err, array) {
        if (err) {
            return callback(err);
        } else {
            return callback(null, array);
        }
    });
};

module.exports.getLimitedList = getLimitedList;