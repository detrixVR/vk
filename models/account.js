var mongoose = require('../mongodb');
var Schema = mongoose.Schema;

var schema = new Schema({
    username: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: false,
        default: ''
    },
    accountId: {
        type: String,
        required: true
    },
    tasks: {
        type: Array,
        required: false,
        default: []
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

exports.Account = mongoose.model('Account', schema);
