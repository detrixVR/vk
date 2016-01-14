var utils = require('../../modules/utils');

module.exports.get = function (req, res) {
    res.render('workplace/admin', {
        user: req.user,
        page: 'admin'
    });
};
