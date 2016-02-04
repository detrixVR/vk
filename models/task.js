var mongoose = require('../mongodb');
var Schema = mongoose.Schema;

var schema = new Schema({
    uid: {
        type: String,
        required: true
    },
    account: {
        type: String,
        required: true
    },
    taskName: {
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
    initLoop: {
        type: Number,
        required: true
    },
    created: {
        type: Date,
        required: false,
        default: Date.now
    }
});

module.exports = mongoose.model('Task', schema);
