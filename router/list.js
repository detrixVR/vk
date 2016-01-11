var AccountListItem = require('../models/lists/proxyListItem');
var AudioListItem = require('../models/lists/audioListItem');
var GroupListItem = require('../models/lists/groupListItem');
var PhotoListItem = require('../models/lists/photoListItem');
var PostListItem = require('../models/lists/postListItem');
var ProxyListItem = require('../models/lists/proxyListItem');
var UserListItem = require('../models/lists/userListItem');
var VideoListItem = require('../models/lists/videoListItem');

var Process = require('../models/process').Process;


var utils = require('../modules/utils');
var async = require('async');

var getForGrid = function (Requester, options, callback) {
    Requester.find({
        username: options.username,
        listName: options.listName,
        content: {"$regex": options.searchPhrase, "$options": "i"}
    }).sort(options.sort).skip((options.current - 1) * options.rowCount).limit(options.rowCount > 0 ? options.rowCount : 0).exec(function (err, docs) {
        return callback(err ? err : null, docs);
    });
};

module.exports.post = function (req, res) {

    var options = null;

    try {
        options = JSON.parse(req.body.options);
    } catch (e) {
        res.status(400).json({
            msg: 'Parsing Error'
        });
        return (0);
    }

    if (!options.listType) {
        res.status(400).json({
            msg: 'Неверные параметры'
        });
        return (0);
    }

    options.listName = options.listName || 'Основной';
    options.username = req.user.username;

    var Requester = null;

    switch (options.listType) {
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
        default :
            return res.status(400).json({
                msg: 'Неверные параметры'
            });
    }

    if (options.forAccounts && options.listType === 'proxy') {
        /*async.waterfall([function (callback) {
         AccountGrid.find({
         username: options.username,
         proxy: {
         $exists: true
         }
         }, function (err, docs) {
         return callback(err ? err : null, docs);
         });
         }], function (err, accounts) {
         if (err) {
         var resp = utils.processError(err);
         return res.status(resp.status).json(resp);
         } else {
         var blockedProxies = [];
         accounts.forEach(function (item) {
         blockedProxies.push(item.proxy);
         });
         ProxyGrid.findOne({
         username: options.username,
         content: {
         $nin: blockedProxies
         },
         valid: 1
         }, function (err, proxy) {
         if (err) {
         var resp = utils.processError(err);
         return res.status(resp.status).json(resp);
         } else {
         res.status(200).json(proxy);
         }
         })
         }
         })*/
    } else {

        async.waterfall([function (callback) {
            Requester.count({
                username: options.username,
                listName: options.listName,
                content: {"$regex": options.searchPhrase, "$options": "i"}
            }, function (err, count) {
                return callback(err ? err : null, count, docs);
            })
        }, function (count, callback) {
            getForGrid(Requester, options, function (err, docs) {
                return callback(err ? err : null, count, docs);
            });
        }], function (err, count, docs) {
            if (err) {
                var resp = utils.processError(err);
                return res.status(resp.status).json(resp);
            } else {
                return res.status(200).json({
                    "current": options.current,
                    "rowCount": options.rowCount,
                    "lists": req.user.lists,
                    "rows": docs,
                    "total": count
                });
            }
        });
    }
};

module.exports.put = function (req, res) {

    var options = null;

    try {
        options = JSON.parse(req.body.options);
    } catch (e) {
        return res.status(400).json({
            msg: 'Parsing Error'
        });
    }

    if (!options.listType || !options.rows || !options.rows.length) {
        return res.status(400).json({
            msg: 'Неверные параметры'
        });
    }

    options.listName = options.listName || 'Основной';

    var Requester = null;

    switch (options.listType) {
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
        default :
            return res.status(400).json({
                msg: 'Неверные параметры'
            });
    }

    async.eachSeries(options.rows, function (item, callback) {

        if (item._id && !/^[a-fA-F0-9]{24}$/.test(item._id)) {
            return callback({
                msg: 'Неверный формат id'
            });
        }

        if (item._id) {

            Requester.update({
                username: req.user.username,
                _id: item._id
            }, item, {
                upsert: false
            }, function (err) {
                return callback(err ? err : null);
            })
        } else {
            var obj = utils.extend({
                username: req.user.username
            }, item);
            new Requester(obj).save(function (err) {
                return callback(err ? err : null);
            })
        }

    }, function (err) {
        if (err) {
            var resp = utils.processError(err);
            return res.status(resp.status).json(resp);
        } else {
            return res.status(200).json({
                msg: 'OK'
            })
        }
    });
};

module.exports.delete = function (req, res) {

    var options = null;

    try {
        options = JSON.parse(req.body.options);
    } catch (e) {
        return res.status(400).json({
            msg: 'Parsing Error'
        });
    }

    if (!options.ids || !options.ids.length || !options.listType) {
        return res.status(400).json({
            msg: 'Неверный запрос'
        });
    }

    var Requester = null;

    switch (options.listType) {
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
        default :
            return res.status(400).json({
                msg: 'Неверные параметры'
            });
    }

    var requestObject = {
        username: req.user.username
    };

    if (options.ids[0] !== 'all') {
        requestObject._id = {
            $in: options.ids
        };
        for (var i = 0; i < options.ids.length; i++) {
            if (/^[a-fA-F0-9]{24}$/.test(options.ids[i]) !== true) {
                return res.status(400).json({
                    msg: 'Неверный запрос'
                });
            }
        }
    }

    Requester.remove(requestObject, function (err) {
        if (err) {
            var resp = utils.processError(err);
            return res.status(resp.status).json(resp);
        } else {
            return res.status(200).json({
                msg: 'OK'
            });
        }
    })
};

module.exports.getForGrid = getForGrid;