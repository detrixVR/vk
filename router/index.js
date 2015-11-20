


function nocache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}

module.exports = function (app) {
    app.get('/',            require('./index').get);



    app.use(function (req, res, next) {
        var err = {
            message: 'Страница не найдена'
        };
        err.status = 404;
        next(err);
    });

    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err,
                user: req.user
            });
        });
    }

    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {
                status: err.status
            },
            user: req.user
        });
    });
};


module.exports.get = function (req, res) {

        res.render('index',{
            pageId: '001'
        });

};