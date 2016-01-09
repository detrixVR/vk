var utils = require('../../modules/utils');

module.exports.get = function (req, res) {
    res.render('workplace/tasks', {
        user: req.user,
        page: 'tasks'
    });
};
