"use strict";

var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    session = require('express-session'),
    url = require('url'),
    intel = require('intel'),
    MongoStore = require('connect-mongo')(session);

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser(config.get('secretCookies')));
app.use(express.static(path.join(__dirname, 'public')));

intel.basicConfig(config.get('intelConfig'));

let handler1 = new intel.handlers.File({
    "class": intel.handlers.File,
    "level": 40,
    "file": "alpha.log",
    "formatter": new intel.Formatter(config.get('intelConfig:formatters:file'))
});
intel.addHandler(handler1);

//intel.setLevel(intel.WARN);
intel.warn('i made it!');
intel.removeHandler(handler1);

let handler2 = new intel.handlers.File({
    "class": intel.handlers.File,
    "level": 40,
    "file": `alpha2.log`,
    "formatter": new intel.Formatter(config.get('intelConfig:formatters:file'))
});
//intel.addHandler(handler2);
//intel.info('i made it!');
//intel.critical('i made it!');
//intel.debug('nobody loves me');

let mongoose = require('mongodb');

app.use(session({
    store: new MongoStore({
        /*db: 'sessions',
         host: parsed.hostname,
         port: parsed.port,
         username: parsed.auth ? parsed.auth.split(':')[0] : null,
         password: parsed.auth ? parsed.auth.split(':')[1] : null*/
        mongooseConnection: mongoose.connection
    }),
    saveUninitialized: false,
    resave: false,
    secret: config.get('secretSessions')
}));

require('./router')(app);


module.exports = app;
