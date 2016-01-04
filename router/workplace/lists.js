
module.exports.get = function (req, res) {
    res.render('workplace/lists', {
        user: req.user,
        page: 'lists'
    });
};
