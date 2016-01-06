var async = require('async');
var executeCommand = require('../../../vkapi').executeCommand;
var utils = require('../../../modules/utils');

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
        case 'doc':
            options.command = 'docs.get';
            options.options = {
                //count: 100
                //offset: 0
            };
            break;
        case 'photoAlbum':
            options.command = 'photos.getAlbums';
            options.options = {
                //count: 100,
                //offset: 0
            };
            break;
        case 'videoAlbum':
            options.command = 'video.getAlbums';
            options.options = {
                count: 100,
                offset: 0
            };
            break;
        case 'audioAlbum':
            options.command = 'audio.getAlbums';
            options.options = {
                count: 100,
                offset: 0
            };
            break;
        case 'note':
            options.command = 'notes.get';
            options.options = {
                count: 100,
                offset: 0
            };
            break;
        case 'friend':
            options.command = 'friends.get';
            options.options = {
                //count: 100,
                //offset: 0
            };
            break;
        case 'dialog':
            options.command = 'messages.getDialogs';
            options.options = {
                count: 200,
                offset: 0
            };
            break;
        case 'wall':
            options.command = 'wall.get';
            options.options = {
                count: 100,
                offset: 0
            };
            break;
        case 'group':
            options.command = 'groups.get';
            options.options = {
                count: 1000,
                offset: 0
            };
            break;
        case 'follower':
            options.command = 'users.getFollowers';
            options.options = {
                count: 1000,
                offset: 0
            };
            break;
        case 'subscribersOut':
            options.command = 'friends.getRequests';
            options.options = {
                out: 1,
                count: 1000
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

                for (var k = 0; k < data.result.response.items.length; k++) {
                    switch (type) {
                        case 'wall':
                            delete data.result.response.items[k].copy_history;
                            break;
                    }
                }

                result = result.concat(data.result.response.items);

                if (!options.options.hasOwnProperty('count') || !options.options.hasOwnProperty('offset')) {

                    return back({
                        next: true
                    });
                }

                options.options.offset += options.options.count;

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