var async = require('async');
var executeCommand = require('../../../vkapi').executeCommand;

var getServicePhotos = function (serviceAlbum, options, processes, credentials, callback, next) {


    options.command = 'photos.get';

    options.options = {
       // owner_id: accountId,
        album_id: serviceAlbum,
        count: 1000,
        offset: 0
    };


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

module.exports = getServicePhotos;