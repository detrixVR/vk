var async = require('async');

var User = require('../../models/user').User;

var AccountListItem = require('../../models/lists/proxyListItem');
var AudioListItem = require('../../models/lists/audioListItem');
var GroupListItem = require('../../models/lists/groupListItem');
var PhotoListItem = require('../../models/lists/photoListItem');
var PostListItem = require('../../models/lists/postListItem');
var ProxyListItem = require('../../models/lists/proxyListItem');
var UserListItem = require('../../models/lists/userListItem');
var VideoListItem = require('../../models/lists/videoListItem');


function getRequester(type) {

    var Requester = null;

    switch (type) {
        case 'proxy':
            Requester = ProxyListItem;
            break;
        case 'account':
            Requester = AccountListItem;
            break;
        case 'person':
            Requester = UserListItem;
            break;
        case 'group':
            Requester = GroupListItem;
            break;
        case 'post':
            Requester = PostListItem;
            break;
        case 'audio':
            Requester = AudioListItem;
            break;
        case 'photo':
            Requester = AudioListItem;
            break;
        case 'video':
            Requester = VideoListItem;
            break;
        case 'process':
            Requester = Process;
            break;
    }

    return Requester;
}


var saveToDbListItems = function (type, result, settings, credentials, next) {


    async.waterfall([
        function (callback) {
            User.findOne(function (err, user) {
                if (err) {
                    return callback(err);
                } else if (user) {
                    return callback(null, user);
                } else {
                    return callback({error: 'error'});
                }
            })
        },
        function (user, callback) {

            var Requester = getRequester(type);

            if (!Requester) {
                return callback({error: 'error'});
            }

            var listName = settings.replaceSelector.value === 2 ? settings.listName.value : 'Основной';

            async.each(result, function (item, yes) {

                item.username = credentials.username;
                item.accountId = credentials.accountId;
                item.listName = listName;

                var newRequester = new Requester(item);

                newRequester.save(function (err) {
                    return yes(err ? err : null);
                });

            }, function (error) {

                var bool = true;

                for (var i = 0; i < user.lists.length; i++) {
                    if (user.lists[i].name === listName) {
                        bool = !bool;
                    }
                }

                if (bool) {
                    user.lists.push({
                        name: listName,
                        accountId: credentials.accountId
                    });
                }


                return callback(error ? error : null, (bool ? user : null));

            });

        },
        function (user, callback) {
            if (user) {
                user.save(function (err) {
                    return callback(err ? err : null);
                })
            } else {
                return callback();
            }
        }
    ], function (err) {
        return next(err ? err : null);
    });


};

module.exports = {
    saveToDbListItems: saveToDbListItems
};