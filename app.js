var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session);

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.get('secretCookies')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    store: new MongoStore({
        db: 'sessions',
        host: 'localhost',
        port: 27017
    }),
    saveUninitialized: false,
    resave: false,
    secret: config.get('secretSessions')
}));

require('./router')(app);








/*
app.get("/", function (req, res) {
    console.log(__dirname + '/index.html');
    res.sendfile(__dirname + '/index.html');
});

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

*/


module.exports = app;
