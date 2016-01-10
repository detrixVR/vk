var utils = require('../../modules/utils');
var url = require('url');

module.exports.get = function (req, res) {

    var urlParts = url.parse(req.url, true);
    var query = urlParts.query;
    var subPage = 'message';

    switch (query.type) {
        case 'message':
        case 'post':
        case 'repost':
        case 'comment':
        case 'like':
            subPage = query.type;
            break;
    }

    res.render('workplace/tasks', {
        user: req.user,
        page: 'tasks',
        subPage: subPage
    });
};
