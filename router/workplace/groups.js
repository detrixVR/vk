var utils = require('../../modules/utils');

module.exports.get = function (req, res) {
    res.render('workplace/groups', {
        user: req.user,
        page: 'groups'
    });
};
