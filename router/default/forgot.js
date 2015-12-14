module.exports.get = function (req, res) {
    res.render('forgot', {
        user: req.user,
        page: 'forgot',
    });
};