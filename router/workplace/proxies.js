var utils = require('../../modules/utils');

module.exports.get = function (req, res) {
    res.render('workplace/proxies', {
        user: req.user,
        page: 'proxies'
    });
};
