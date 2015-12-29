var utils = require('../../modules/utils');

module.exports.get = function (req, res) {
    res.render('workplace/accounts', {
        user: req.user,
        page: 'accounts'
    });
};
