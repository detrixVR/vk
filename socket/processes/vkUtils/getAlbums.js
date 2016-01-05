var async = require('async');
var utils = require('../../../modules/utils');
var executeCommand = require('../../../vkapi').executeCommand;


var getAlbums = function (type, options, processes, credentials, callback, next) {

    switch (type) {
        case 'photo':
            options.command = 'photos.getAlbums';
            break;
        case 'video':
            options.command = 'video.getAlbums';
            break;
        case 'audio':
            options.command = 'audio.getAlbums';
            break;
        default :
            return next({error: 'error'});
    }

    options.options = {
       // owner_id: 275667666,
        count: 100,
        offset: 0
       // need_system: 1,
       // need_covers: 1,
       // photo_sizes: 1
    };

    var result = [];

   // console.log(options);
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

                if (options.options.offset >= count ||
                    options.options.offset >= 1000) {

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

        options.options.offset += 10;

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

module.exports = getAlbums;