var mongoose = require('../mongodb');
var Schema = mongoose.Schema;

var schema = new Schema({
    uid: {
        type: String,
        required: true
    },
    instance: {
        type: Number,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    accountId: {
        type: String,
        required: true
    },

    created: {
        type: Date,
        required: false,
        default: Date.now
    }
});

module.exports = mongoose.model('Account', schema);
