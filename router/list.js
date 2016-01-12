var utils = require('../modules/utils');
var async = require('async');

var dbUtils = require('../modules/dbUtils');


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

    if (!options.listType || !options.accountId) {
        res.status(400).json({
            msg: 'Неверные параметры'
        });
        return (0);
    }

    options.listName = options.listName || 'Основной';
    options.username = req.user.username;

    dbUtils.getFromDbForGrid(options.listType, options, function (err, count, docs) {
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
    })
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

    if (!options.listType || !options.rows || !options.rows.length || !options.accountId) {

        return res.status(400).json({
            msg: 'Неверные параметры'
        });
    }

    options.listName = options.listName || 'Основной';
    options.username = req.user.username;

    dbUtils.putToDbForGrid(options.listType, options, function (err) {
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

module.exports.delete = function (req, res) {

    var options = null;

    try {
        options = JSON.parse(req.body.options);
    } catch (e) {
        return res.status(400).json({
            msg: 'Parsing Error'
        });
    }

    if (!options.ids || !options.ids.length || !options.listType || !options.accountId) {

        return res.status(400).json({
            msg: 'Неверный запрос'
        });
    }

    options.listName = options.listName || 'Основной';
    options.username = req.user.username;

    dbUtils.removeFromDbForGrid(options.listType, options, function (err) {
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