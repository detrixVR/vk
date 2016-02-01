"use strict";

var nconf = require('nconf');
var path = require('path');

let filename = 'development.json';

switch(process.env.NODE_ENV){
    case 'development':
        break;
    case 'production':
        filename = 'production.json';
        break;
    default:
        throw new  Error('Не задано окружение');
}


nconf.argv()
    .env()
    .file({ file: path.join(__dirname, filename) });

module.exports = nconf;
