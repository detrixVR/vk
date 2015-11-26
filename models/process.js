var mongoose = require('../mongodb');
var Schema = mongoose.Schema;

var schema = new Schema({
    username: {
        type: String,
        required: true
    },
    pageId: {
        type: String,
        required: true
    },
    accountId: {
        type: String,
        required: true
    },
    settings: {
        type: Array,
        required: true
    },
    messages: {
        type: Array,
        required: true
    },
    created: {
        type: Date,
        required: false,
        default: Date.now
    }
});

exports.Process = mongoose.model('Process', schema);
