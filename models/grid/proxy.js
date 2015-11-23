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
    status: {
        type: Number,
        required: false,
        default: 1
    },
    created: {
        type: Date,
        required: false,
        default: Date.now
    }
});

exports.ProxyGrid = mongoose.model('ProxyGrid', schema);
