var mongoose = require('../../mongodb');
var Schema = mongoose.Schema;

var schema = new Schema({
    username: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    valid: {
        type: Number,
        required: false,
        default: 0
    },
    created: {
        type: Date,
        required: false,
        default: Date.now
    }
});

exports.ProxyGrid = mongoose.model('ProxyGrid', schema);
