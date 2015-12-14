var user = require('../models/user').User;

function loadUser(req, res, next) {
    if (req.session.userId) {
        user.findById(req.session.userId, function (err, user) {
            if (err) {
                next({
                    message: 'Server Error',
                    status: 500
                });
                return (0);
            } else if (user) {
                req.user = user;
                next();
            } else {
                req.user = null;
                next();
            }
        });
    } else {
        req.user = null;
        next();
    }
}

function needAuth(req, res, next) {
    if (req.user) {
        next();
    } else {
        var err = new Error('Вы не авторизованы');
        err.status = 403;
        next(err);
        return (0);
    }
}

module.exports.loadUser = loadUser;
module.exports.needAuth = needAuth;