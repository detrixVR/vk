
var path = require('path');
var url = require('url');

module.exports.get = function (req, res) {

    var urlParts = url.parse(req.url, true);
    var query = urlParts.query;

    res.sendFile(path.join(__dirname, './static/', query.link + '.html'));
};