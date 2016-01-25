var AccountGrid = require('../models/grid/account').AccountGrid;
var utils = require('../modules/utils');
var async = require('async');

function getFirstAccount(username, callback) {
    AccountGrid.findOne({
        username: username
    }, function (err, doc) {
        return callback(err, doc);
    });
}

module.exports.post = function (req, res) {


    var parseQueryString = function (str) {

        // var str = window.location.search;
        var objURL = {};

        str.replace(
            new RegExp("([^?=&]+)(=([^&]*))?", "g"),
            function ($0, $1, $2, $3) {
                objURL[$1] = $3;
            }
        );
        return objURL;
    };

//Example how to use it:
    //   var params = parseQueryString();
    // alert(params["foo"]);

    var location = null;

    try {
        location = JSON.parse(req.body.location);
    } catch (err) {
        if (err) {
            var resp = utils.processError(err);
            return res.status(resp.status).json(resp);
        }
    }

    if (location) {
        // console.log(location);


        var url = location.pathname.substring(1);

        var result = {
            pageId: 'pageId',
            accountInfo: {
                accountId: 'defaultAccount',
                photo_50: '/images/camera_50.png',
                photo_100: '/images/camera_100.png',
                last_name: 'last_name',
                first_name: 'first_name'
            }
        };

        var objURL = parseQueryString(location.search);

        switch (url) {
            case 'admin':
                result.pageId = 'adminPanel';
                break;
            case 'proxies':
                result.pageId = 'validateProxies';
                break;
            case 'accounts':
                result.pageId = 'validateAccounts';
                break;
            case 'peoples':
                result.pageId = 'searchPeoples';
                break;
            case 'groups':
                result.pageId = 'searchGroups';
                break;
            case 'lists':
                result.pageId = 'listCreatingFromPerson';

                switch (objURL.type) {
                    case 'group':
                        result.pageId = 'listCreatingFromGroup';
                        break;
                    case 'audio':
                        result.pageId = 'listCreatingFromAudio';
                        break;
                    case 'video':
                        result.pageId = 'listCreatingFromVideo';
                        break;
                    case 'post':
                        result.pageId = 'listCreatingFromPost';
                        break;
                }
                break;
            case 'tasks':
                result.pageId = 'taskExecution';
                break;
            case 'config':

                result.pageId = 'configurationClean';

                switch (objURL.type) {
                    case 'copy':
                        result.pageId = 'configurationCopy';
                        break;
                    case 'group':
                        result.pageId = 'configurationGroup';
                        break;
                }

                break;
        }

        const NEED_ACCOUNT = [
            'peoples',
            'groups',
            'lists',
            'tasks'
        ];


        if (NEED_ACCOUNT.indexOf(url) > -1) {

            if (objURL['account']) {

                async.waterfall([function (callback) {

                    var dbQuery = {
                        username: req.user.username,
                        id: objURL['account']
                    };

                    if (objURL['next']) {
                        dbQuery.id = {
                            $gt: objURL['account']
                        }
                    }

                    AccountGrid.findOne(dbQuery, function (err, doc) {
                        if (err) {
                            return callback(err);
                        } else {
                            return callback(null, doc);
                        }
                    })


                }, function (doc, callback) {
                    if (!doc) {
                        getFirstAccount(req.user.username, function (err, doc) {
                            if (err) {
                                return callback(err);
                            } else {
                                return callback(null, doc);
                            }
                        })
                    } else {
                        return callback(null, doc);
                    }

                }], function (err, account) {
                    if (err) {
                        var resp = utils.processError(err);
                        return res.status(resp.status).json(resp);
                    } else {
                        if (account) {
                            result.accountInfo = account
                        }
                        res.status(200).json(result);
                    }

                })
            } else {
                getFirstAccount(req.user.username, function (err, account) {
                    if (err) {
                        var resp = utils.processError(err);
                        return res.status(resp.status).json(resp);
                    } else {
                        if (account) {
                            result.accountInfo = account;
                        }
                        res.status(200).json(result);
                    }
                })
            }
        } else {
            res.status(200).json(result);
        }
    }
};