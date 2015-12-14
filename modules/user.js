var User = require('../models/user').User,
    bCrypt = require('bcrypt-nodejs'),
    async = require('async');


var isValidPassword = function (user, password) {
    return bCrypt.compareSync(password, user.password);
};

var createHash = function (password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

function changePass(user, oldpass, newpass, callback) {

    if (isValidPassword(user, oldpass)) {
        user.password = createHash(newpass);
        user.save(function (err) {
            if (err) {
                return callback(err);
            } else {
                return callback();
            }
        })
    } else {
        return callback({notify: true, msg: 'Неверный старый пароль'});
    }
}

function userSignup(username, password, callback) {
    User.findOne({username: username}, function (err, doc) {
        if (err) {
            return callback(err);
        } else if (doc) {
            return callback({
                notify: true,
                msg: 'Пользователь с таким именем уже существует'
            });
        } else {
            async.waterfall([
                function (callback) {
                    var newUser = new User();
                    newUser.username = username;
                    newUser.password = password ? createHash(password) : 'password';
                    newUser.deposit = 0;
                    newUser.created = new Date();
                    newUser.email = '';

                    newUser.save(function (err, user) {
                        if (err) {
                            return callback(err);
                        } else {
                            return callback(null, user);
                        }
                    });
                }
            ], function (err, user) {
                if (err) {
                    return callback(err);
                } else {
                    return callback(null, user);
                }
            });
        }
    });
}


function userLogin(username, password, callback) {
    User.findOne({username: username}, function (err, user) {
        if (err) {
            return callback(err);
        } else if (user) {
            if (isValidPassword(user, password)) {
                return callback(null, user);
            } else {
                return callback({notify: true, msg: 'Неправильная комбинация логина и пароля'});
            }
        } else {
            return callback({notify: true, msg: 'Пользователь с таким именем не найден'});
        }
    });
}

module.exports.userSignup = userSignup;
module.exports.userLogin = userLogin;
module.exports.changePass = changePass;
