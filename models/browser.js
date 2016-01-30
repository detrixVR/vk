var mongoose = require('../mongodb');
var Schema = mongoose.Schema;

var schema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    pass: {
        type: String,
        required: true
    },
    logined: {
        type: Boolean,
        required: true
    },
    cookiesString: {
        type: String,
        required: true
    },
    headers: {
        type: Object,
        required: true
    },
    cookies: {
        type: Array,
        required: true
    },
    hostName: {
        type: String,
        required: true
    },
    protocol: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    currentUrl: {
        type: String,
        required: true
    },
    uid: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        required: false,
        default: Date.now
    }
});

module.exports = mongoose.model('dbBrowser', schema);
