var ProxyGrid = require('../models/grid/proxy').ProxyGrid;
var AccountGrid = require('../models/grid/account').AccountGrid;
var PersonGrid = require('../models/grid/person').PersonGrid;
var GroupGrid = require('../models/grid/group').GroupGrid;
var utils = require('../modules/utils');
var url = require('url');

module.exports.get = function (req, res) {


    if (!req.params || !req.params.type) {
        res.status(400).json({
            msg: 'Неверный запрос'
        });
        return (0);
    }

    var urlParts = url.parse(req.url, true);
    var query = urlParts.query;

    console.log(req.params.type);
    console.log(query);


    var Requester = null;

    switch (req.params.type) {
        case 'proxy.txt':
            Requester = ProxyGrid;
            break;
        case 'account.txt':
            Requester = AccountGrid;
            break;
        case 'person.txt':
            Requester = PersonGrid;
            break;
        case 'group.txt':
            Requester = GroupGrid;
            break;
    }

    if (Requester) {

        var obj = {
            username: req.user.username
        };

        if (query.accountId) {
            obj['accountId'] = query.accountId;
        }

        Requester.find(obj, function (err, docs) {
            if (err) {
                var resp = utils.processError(err);
                return res.status(resp.status).json(resp);
            } else {
                res.set({'Content-Type': 'text/plain'});
                res.set({"Content-Disposition": "attachment; filename=\"" + req.params.type + "\""});
                res.send(docs.map(function (item) {
                    return item.content || item.id
                }).join('\r\n'));
            }
        });


    } else {
        res.status(400).json({
            msg: 'Неверный запрос'
        });
    }


};