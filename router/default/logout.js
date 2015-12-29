module.exports.get = function (req, res) {
    if (req.session) {
        req.session.destroy(function () {
            res.clearCookie('username', {path: '/'});
            res.clearCookie('id', {path: '/'});
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
};