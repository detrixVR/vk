var ProxyGrid = require('../models/grid/proxy').ProxyGrid;
var AccountGrid = require('../models/grid/account').AccountGrid;
var PersonGrid = require('../models/grid/person').PersonGrid;
var GroupGrid = require('../models/grid/group').GroupGrid;
var PostGrid = require('../models/grid/post').PostGrid;
var utils = require('../modules/utils');
var async = require('async');

module.exports.get = function (req, res) {
    res.render('grid', {});
};

var getForGrid = function (Requester, options, callback) {
    Requester.find({
        username: options.username,
        content: {"$regex": options.searchPhrase, "$options": "i"}
    }).sort(options.sort).skip((options.current - 1) * options.rowCount).limit(options.rowCount > 0 ? options.rowCount : 0).exec(function (err, docs) {
        return callback(err ? err : null, docs);
    });
};

module.exports.post = function (req, res) {


    req.user = {
        username: 'huyax'
    } //TODO:



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

    options.username = req.user.username;

    var Requester = null;

    switch (options.listType) {
        case 'proxy':
            Requester = ProxyGrid;
            break;
        case 'account':
            Requester = AccountGrid;
            break;
        case 'person':
            Requester = PersonGrid;
            break;
        case 'group':
            Requester = GroupGrid;
            break;
        case 'post':
            Requester = PostGrid;
            break;
    }

    if (!Requester) {
        res.status(400).json({
            msg: 'Неверные параметры'
        })
    }

    if (options.forAccounts && options.listType === 'proxy') {
        async.waterfall([function (callback) {
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
        })
    } else {

        async.waterfall([function (callback) {
            Requester.count({
                username: options.username
            }, function (err, count) {
                if (err)
                    return callback(err);
                else
                    return callback(null, count)
            })
        }], function (err, count) {
            if (err) {
                var resp = utils.processError(err);
                return res.status(resp.status).json(resp);
            } else {

               // options.count = count;

                getForGrid(Requester, options, function (err, docs) {
                    if (err) {
                        var resp = utils.processError(err);
                        return res.status(resp.status).json(resp);
                    } else {
                        res.status(200).json({
                            "current": options.current,
                            "rowCount": options.rowCount,
                            "rows": docs,
                            "total": count
                        });
                    }
                });
            }
        });
    }
};

module.exports.put = function (req, res) {
    req.user = {
        username: 'huyax'
    } //TODO:

    var options = null;

    try {
        options = JSON.parse(req.body.options);
    } catch (e) {
        res.status(400).json({
            msg: 'Parsing Error'
        });
        return (0);
    }

    if (!options.listType || (!options.rows || !options.rows.length)) {
        res.status(400).json({
            msg: 'Неверные параметры'
        });
        return (0);
    }

    var Requester = null;

    switch (options.listType) {
        case 'proxy':
            Requester = ProxyGrid;
            break;
        case 'account':
            Requester = AccountGrid;
            break;
        case 'person':
            Requester = PersonGrid;
            break;
        case 'group':
            Requester = GroupGrid;
            break;
        case 'post':
            Requester = PostGrid;
            break;
    }

    if (!Requester) {
        res.status(400).json({
            msg: 'Неверные параметры'
        });
        return (0);
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
    req.user = {
        username: 'huyax'
    } //TODO:
    var options = null;

    try {
        options = JSON.parse(req.body.options);
    } catch (e) {
        res.status(400).json({
            msg: 'Parsing Error'
        });
        return (0);
    }

    if (!options.ids || !options.ids.length || !options.listType) {
        res.status(400).json({
            msg: 'Неверный запрос'
        });
        return (0);
    }

    var Requester = null;

    switch (options.listType) {
        case 'proxy':
            Requester = ProxyGrid;
            break;
        case 'account':
            Requester = AccountGrid;
            break;
        case 'person':
            Requester = PersonGrid;
            break;
        case 'group':
            Requester = GroupGrid;
            break;
        case 'post':
            Requester = PostGrid;
            break;
    }

    if (!Requester) {
        res.status(400).json({
            msg: 'Неверные параметры'
        });
        return (0);
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
                res.status(400).json({
                    msg: 'Неверный запрос'
                });
                return (0);
            }
        }
    }

    Requester.remove(requestObject, function (err) {
        if (err) {
            var resp = utils.processError(err);
            return res.status(resp.status).json(resp);
        } else {
            res.status(200).json({
                msg: 'OK'
            });
        }
    })
};

module.exports.getForGrid = getForGrid;