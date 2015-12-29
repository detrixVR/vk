var utils = require('../../modules/utils');

module.exports.get = function (req, res) {
    res.render('workplace/peoples', {
        user: req.user,
        page: 'peoples'
    });
};
