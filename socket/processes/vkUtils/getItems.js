var async = require('async');
var executeCommand = require('../../../vkapi').executeCommand;

var getItems = function (type, options, processes, credentials, callback, next) {

    switch (type) {
        case 'video':
            options.command = 'video.get';
            options.options = {
                count: 200,
                offset: 0
            };
            break;
        case 'audio':
            options.command = 'audio.get';
            options.options = {
                count: 6000,
                offset: 0
            };
            break;
        default:
            console.error('#1');
            return next({error: error});
    }


    var result = [];

    async.forever(function (back) {

        executeCommand(options, processes, credentials, callback, function (err, data) {

            console.log(err);
            console.log(data);
            if (err) {
                return back(err);
            } else if (
                data &&
                data.result &&
                data.result.response &&
                data.result.response.items) {

                var count = data.result.response.count;

                result = result.concat(data.result.response.items);

                if (options.options.offset >= count) {

                    return back({
                        next: true
                    });

                } else {
                    return back();
                }

            } else {
                return back({error: 'error'});
            }
        });

        options.options.offset += options.options.count;

    }, function (err) {


        switch (err.arg) {
            case 5:

                err.msg = utils.createMsg({msg: err.msg, type: 3});
                return next(err);

        }

        if (err.next) {
            console.log(result);
            return next(null, result);
        } else {
            return next(err);
        }

    });


};

module.exports = getItems;