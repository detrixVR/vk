var async = require('async');

var User = require('../../models/user').User;

var AccountListItem = require('../../models/lists/accountListItem');
var AudioListItem = require('../../models/lists/audioListItem');
var GroupListItem = require('../../models/lists/groupListItem');
var PhotoListItem = require('../../models/lists/photoListItem');
var PostListItem = require('../../models/lists/postListItem');
var ProxyListItem = require('../../models/lists/proxyListItem');
var UserListItem = require('../../models/lists/userListItem');
var VideoListItem = require('../../models/lists/videoListItem');

var utils = require('../../modules/utils');

function getAccountByOptions(options, callback) {
    return AccountListItem.findOne(options, callback);
}


function getRequester(type) {

    console.log('getRequester');
    console.log(type);

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

var getForGrid = function (Requester, options, callback) {
    Requester.find({
        username: options.username,
        accountId: options.accountId,
        listName: options.listName || 'Основной',
        content: {"$regex": options.searchPhrase, "$options": "i"}
    }).sort(options.sort).skip((options.current - 1) * options.rowCount).limit(options.rowCount > 0 ? options.rowCount : 0).exec(function (err, docs) {
        return callback(err ? err : null, docs);
    });
};

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

            var listName = settings.replaceSelector.value === 2 ? settings.listName.value : settings[type + 'Grid'].value.listName ? settings[type + 'Grid'].value.listName : 'Основной';

            async.eachSeries(result, function (item, yes) {

                /*item.username = credentials.username;
                 item.accountId = credentials.accountId;
                 item.listName = listName;*/

                var itemToSave = utils.extend({}, {
                    username: credentials.username,
                    accountId: credentials.accountId,
                    listName: listName,
                    content: ''
                }, {value: item});

                //console.log(itemToSave);

                var newRequester = new Requester(itemToSave);

                // console.log(newRequester);

                newRequester.save(function (err) {
                    console.log(err);
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

var getFromDbBySettings = function (type, settings, credentials, callback) {

    var Requester = getRequester(type);

    if (!Requester) {
        return callback({error: 'error'});
    }

    var gridOptions = settings[type + 'Grid'].value;

    switch (settings.targetSelector.value) {
        case 0:
            Requester.find({
                username: credentials.username,
                accountId: credentials.accountId,
                listName: gridOptions.listName || 'Основной',
            }, function (err, docs) {
                return callback(err ? err : null, docs);
            });
            break;
        case 1:
            getForGrid(Requester, extend({}, credentials, options), function (err, docs) {
                return callback(err ? err : null, docs);
            });
            break;
        case 2:
            Requester.find({
                username: credentials.username,
                accountId: credentials.accountId,
                listName: gridOptions.listName || 'Основной',
                _id: {$in: settings[type + 'Grid'].value.selectedRows}
            }, function (err, docs) {
                return callback(err ? err : null, docs);
            });
            break;
        default :
            return callback({error: 'error'});
    }
};

var getFromDbForGrid = function (type, options, next) {

    async.waterfall([
        function (callback) {

            var Requester = getRequester(type);

            if (!Requester) {
                return callback({error: 'error'});
            }

            Requester.count({
                username: options.username,
                accountId: options.accountId,
                listName: options.listName,
                content: {"$regex": options.searchPhrase, "$options": "i"}
            }, function (err, count) {
                if (err)
                    return callback(err);
                else
                    return callback(null, count, Requester)
            })
        },
        function (count, Requester, callback) {
            getForGrid(Requester, options, function (err, docs) {
                return callback(err ? err : null, count, docs);
            });
        }
    ], function (err, count, docs) {
        return next(err ? err : null, count, docs)
    });
};

var removeFromDbForGrid = function (type, options, callback) {


    var requestObject = {
        username: options.username,
        accountId: options.accountId
    };

    if (options.ids[0] !== 'all') {
        requestObject._id = {
            $in: options.ids
        };
        for (var i = 0; i < options.ids.length; i++) {
            if (/^[a-fA-F0-9]{24}$/.test(options.ids[i]) !== true) {
                return callback({
                    msg: 'Неверный запрос'
                });
            }
        }
    }

    var Requester = getRequester(type);

    if (!Requester) {
        return callback({error: 'error'});
    }

    Requester.remove(requestObject, function (err) {
        callback(err ? err : null);
    })
};

var putToDbForGrid = function (type, options, next) {

    var Requester = getRequester(type);

    if (!Requester) {
        return next({error: 'error'});
    }


    async.eachSeries(options.rows, function (item, callback) {


        if (item._id) {

            if (!utils.validateDbId(item._id)) {
                return callback({
                    msg: 'Неверный формат id'
                });
            }

            Requester.update({
                username: options.username,
                _id: item._id
            }, item, {
                upsert: false
            }, function (err) {
                return callback(err ? err : null);
            })

        } else {

            var obj = utils.extend({
                username: options.username,
                accountId: options.accountId
            }, item);

            new Requester(obj).save(function (err) {
                return callback(err ? err : null);
            })
        }

    }, function (err) {
        return next(err ? err : null);
    });
};

var clearList = function (type, options, callback) {

    var Requester = getRequester(type);

    if (!Requester) {
        return callback({error: 'error'});
    }

    Requester.remove({
        username: options.username,
        accountId: options.accountId,
        listName: options.listName
    }, function (err) {
        return callback(err ? err : null);
    });

};

var getAccountByCredentials = function (credentials, callback) {
    AccountListItem.findOne({
        username: credentials.user,
        accountId: credentials.accountId
    }, function (err, account) {
        return callback(err ? err : null, account);
    })
};

var getItemFromDbById = function (type, id, callback) {

    var Requester = getRequester(type);

    if (!Requester) {
        return callback({error: 'error'});
    }

    Requester.findOne({_id: id}, function (err, item) {
        return callback(err ? err : null, item);
    });
};

var removeItemFromDbById = function (type, id, callback) {

    var Requester = getRequester(type);

    if (!Requester) {
        return callback({error: 'error'});
    }

    Requester.findByIdAndRemove({_id: id}, function (err) {
        return callback(err ? err : null);
    });
};

module.exports = {
    saveToDbListItems: saveToDbListItems,
    getFromDbBySettings: getFromDbBySettings,
    getFromDbForGrid: getFromDbForGrid,
    removeFromDbForGrid: removeFromDbForGrid,
    putToDbForGrid: putToDbForGrid,
    getAccountByCredentials: getAccountByCredentials,
    getItemFromDbById: getItemFromDbById,
    removeItemFromDbById: removeItemFromDbById,
    getAccountByOptions: getAccountByOptions,
    clearList: clearList
};