var user = require('../../modules/user');
var url = require('url');


module.exports.get = function (req, res) {
    res.render('login', {
        user: req.user,
        page: 'login'
    });
};


module.exports.post = function (req, res) {

    if (req.body) {
        if (req.body.username && req.body.password) {

            var username = req.body.username;
            var password = req.body.password;
            var enemy = req.body.remember === 'true';

            user.userLogin(username, password, function (err, user) {
                if (err) {
                    if (err.notify) {
                        res.status(400).json({
                            errorText: err.msg,
                            fields: ['username', 'password']
                        });
                        return (0);
                    }
                    console.error('here');
                    console.error(err);
                    res.status(500).json('Ошибка сервера');
                    return (0);
                } else {
                    req.session.userId = user._id;
                    if (!enemy) {
                        var expires = new Date(Date.now() + 365 * 86400000);
                        res.cookie('username', user.username, {
                            expires: expires,
                            httpOnly: true,
                            signed: true
                        });
                        res.cookie('id', user._id, {
                            expires: expires,
                            httpOnly: true,
                            signed: true
                        });
                    } else {
                        res.clearCookie('username', {path: '/'});
                        res.clearCookie('id', {path: '/'});
                    }
                    res.status(200).json({
                        msg: 'OK'
                    });
                }
            });
        } else {
            res.status(400).json({
                errorText: 'Неверные параметры'
            });
        }
    } else {
        res.status(400).json({
            errorText: 'Неверные параметры'
        });
    }
};