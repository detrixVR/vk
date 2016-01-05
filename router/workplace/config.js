var url = require('url');

module.exports.get = function (req, res) {

    var urlParts = url.parse(req.url, true);
    var query = urlParts.query;

    var processId = 'configurationClean';

    switch (query.type) {
        case 'clean':
            break;
        case 'copy':
            processId = 'configurationCopy';
            break;
        case 'group':
            processId = 'configurationGroup';
            break;
        default :
            query.type = 'clean';
            break;
    }

    res.render('workplace/config', {
        user: req.user,
        page: 'config',
        type: query.type,
        processId: processId
    })

};