var mongoose = require('../mongodb');
var Schema = mongoose.Schema;

var schema = new Schema({
    content: {
        type: String,
        required: false,
        default: ''
    },
    username: {
        type: String,
        required: true
    },
    accountId: {
        type: String,
        required: true
    },
    accountUid: {
        type: String,
        required: true
    },
    settings: {
        type: Object,
        required: true
    },
    messages: {
        type: Array,
        required: true
    },
    state: {
        type: Number,
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

exports.Task = mongoose.model('Task', schema);
