var mongoose = require('../mongodb');
var Schema = mongoose.Schema;

var schema = new Schema({
    username: {
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
