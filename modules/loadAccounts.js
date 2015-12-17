var Account = require('../models/grid/account').AccountGrid;
var url = require('url');

function getFirstAccount(callback) {
    Account.findOne({
        username: 'huyax'
    }, function (err, doc) {
        return callback(err, doc);
    });
}

function loadAccounts(req, res, next) {

    var urlParts = url.parse(req.url, true);
    var query = urlParts.query;

    if (query.account && !isNaN(parseInt(query.account))) {

        var dbQuery = {
            username: 'huyax',
            id: query.account
        };

        if (query.next) {
            dbQuery.id = {
                $gt: query.account
            }
        }

        Account.findOne(dbQuery, function (err, doc) {
            if (err) {
                console.error(err);
                next({
                    message: 'Server Error',
                    status: 500
                });
            } else if (!doc) {
                getFirstAccount(function (err, doc) {
                    if (err) {
                        next({
                            message: 'Server Error',
                            status: 500
                        });
                    } else if (doc) {
                        req.account = doc;
                        next();
                    } else {
                        res.render('noAccounts', {
                            user: req.user,
                            page: 'Ошибка',
                            accounts: []
                        })
                    }
                });

            } else {
                req.account = doc;
                next();
            }
        })
    } else {
        getFirstAccount(function (err, doc) {
            if (err) {
                next({
                    message: 'Server Error',
                    status: 500
                });
            } else if (doc) {
                req.account = doc;
                next();
            } else {
                res.render('noAccounts', {
                    user: req.user,
                    page: 'Ошибка',
                    accounts: []
                })
            }
        });
    }
}

module.exports = loadAccounts;