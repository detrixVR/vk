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
        default:''
    },
    accountId: {
        type: String,
        required: true
    },
    processId: {
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
    created: {
        type: Date,
        required: false,
        default: Date.now
    }
});

exports.Process = mongoose.model('Process', schema);
exports.db = mongoose.connection;
