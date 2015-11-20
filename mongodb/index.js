var mongoose        = require('mongoose'),
    config          = require('../config');

var db = mongoose.connection;

db.on('connecting', function () {
    console.log('[M] connecting to MongoDB...');
});

db.on('error', function (error) {
    console.error('[M] Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});
db.on('connected', function () {
    console.log('[M] MongoDB connected!');
});
db.once('open', function () {
    console.log('[M] MongoDB connection opened!');
});
db.on('reconnected', function () {
    console.log('[M] MongoDB reconnected!');
});
db.on('disconnected', function () {
    console.error('[M] MongoDB disconnected!');
    //  mongoose.connect(config.get('mongoose:uri_heroku'), config.get('mongoose:options'));
});

mongoose.connect(config.get('mongoose:uri_local'), config.get('mongoose:options'));

module.exports = mongoose;
module.exports.connection = db;

