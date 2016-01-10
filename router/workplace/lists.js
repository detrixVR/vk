
var url = require('url');

module.exports.get = function (req, res) {

    var urlParts = url.parse(req.url, true);
    var query = urlParts.query;
    var subPage = 'person';

    switch (query.type) {
        case 'audio':
        case 'video':
        case 'person':
        case 'group':
        case 'post':
            subPage = query.type;
            break;
    }

    res.render('workplace/lists', {
        user: req.user,
        page: 'lists',
        subPage: subPage
    });
};
