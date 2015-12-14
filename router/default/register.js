var user = require('../../modules/user'),
 //   mailer = require('../../modules/mailer'),
    utils = require('../../modules/utils');


module.exports.get = function (req, res) {
    res.render('register', {
        user: req.user,
        page: 'register'
    });
};


module.exports.post = function (req, res) {

    if (req.body) {

        if (req.body.username && req.body.password && req.body.captcha) {

            var username = req.body.username;
            var password = req.body.password;
            var answer = req.body.captcha;

            var captcha = req.session.captcha ? req.session.captcha : null;

            if (!captcha) {

                res.status(403).json({
                    errorText: 'Неверный код с картинки'
                });

                return (0);

            } else {
                if (username.length >= 5 && username.length <= 15 &&
                    password.length >= 5 && password.length <= 15) {
                    console.log(req.session.captcha);
                    if (answer == captcha) {
                        user.userSignup(username, password, function (err, user) {
                            if (err) {
                                var resp = utils.processError(err);
                                res.status(resp.status).json(resp);
                                return (0);
                            } else if (user) {
                                console.log(user);

                                var options = {};

                                /* mailer.sendMail('signup', options, function () {
                                 req.session.userId = user[0]._id;
                                 res.cookie('username', user[0].username, {
                                 maxAge: 365 * 86400000,
                                 httpOnly: true,
                                 signed: true
                                 });
                                 res.cookie('id', user[0]._id, {
                                 maxAge: 365 * 86400000,
                                 httpOnly: true,
                                 signed: true
                                 });
                                 res.status(200).json('OK');
                                 });*/

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

                                res.status(200).json({
                                    msg: 'OK'
                                });
                            } else {
                                res.status(200).json({
                                    msg: 'wtf'
                                });
                            }
                        });
                    } else {

                        res.status(403).json({
                            errorText: 'Неверный код с картинки'
                        });
                    }
                } else {
                    res.status(400).json({
                        errorText: 'Длина логина/пароля неверная'
                    });
                }
            }
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