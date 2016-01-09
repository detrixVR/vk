var loadAccounts = require('../modules/loadAccounts');
var loadUser = require('../modules/loadUser');


var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({storage: storage});
//var upload = multer({ dest: 'uploads2/' })

function nocache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}

module.exports = function (app) {

    app.use(function (req, res, next) {
        // console.log(req.baseUrl);
        // console.log(req.url);
        // console.log(req._parsedUrl);
        //console.log(req.client.parser.incoming.originalUrl);
        //console.log(req.originalUrl);
        return next();
    });

    app.use(function (req, res, next) {
        req.sio = app.get('hovan');
        return next();
    });


    app.use(function (req, res, next) {
        if (req.signedCookies['username'] && req.signedCookies['id']) {
            req.session.userName = req.signedCookies['username'];
            req.session.userId = req.signedCookies['id'];
        }
        return next();
    });

    app.use(loadUser.loadUser);

    app.use(upload.any());


    app.get('/', require('./index').get);

    app.post('/account', require('./account').post);

    app.get('/proxies', require('./workplace/proxies').get);
    app.get('/accounts', require('./workplace/accounts').get);
    app.get('/peoples', require('./workplace/peoples').get);
    app.get('/groups', require('./workplace/groups').get);
    app.get('/lists', require('./workplace/lists').get);
    // app.get('/tasks', require('./workplace/tasks').get);
    app.get('/config', require('./workplace/config').get);

    app.get('/logout', require('./default/logout').get);

    app.get('/upload', require('./upload').get);
    app.post('/upload', require('./upload').post);


    app.get('/forgot', require('./default/forgot').get);
    app.get('/login', require('./default/login').get);
    app.post('/login', require('./default/login').post);
    app.get('/register', require('./default/register').get);
    app.post('/register', require('./default/register').post);

    app.get('/captcha.png', /* nocache,*/ require('./captcha').get);

    app.get('/grid', require('./grid').get);
    app.post('/grid', require('./grid').post);
    app.put('/grid', require('./grid').put);
    app.delete('/grid', require('./grid').delete);

    app.post('/vkapi', require('./vkapi').post);

    app.get('/save/:type', require('./save').get);

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
            console.log(err.message);
            console.log(err.status);
            if (req.headers["x-requested-with"] != 'XMLHttpRequest') {
                res.render('error', {
                    message: err.message,
                    error: err,
                    user: req.user
                });
            } else {
                res.json({
                    message: err.message,
                    error: err
                })
            }

        });
    } else {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            console.log(err.message);
            console.log(err.status);
            if (req.headers["x-requested-with"] != 'XMLHttpRequest') {
                res.render('error', {
                    message: err.message,
                    error: {
                        status: err.status
                    },
                    user: req.user
                });
            } else {

            }
            res.json({
                message: err.message,
                error: {
                    status: err.status
                }
            })
        });
    }
};


module.exports.get = function (req, res) {

    if (!req.session.userId) {
        res.render('index', {
            user: null,
            page: 'index'
        });
    } else {
        res.render('workplace/index', {
            user: req.user,
            page: 'index',
            accounts: [{
                accountId: 'defaultAccount'
            }],
            processId: 'tasksListen'
        });
    }

};