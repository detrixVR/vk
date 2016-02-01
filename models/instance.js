var mongoose = require('mongodb');
var Schema = mongoose.Schema;

var schema = new Schema({
    sn: {
        type: Number,
        required: true
    },
    accounts: {
        type: Array,
        required: false,
        default: []
    },
    created: {
        type: Date,
        required: false,
        default: Date.now
    }
});

module.exports = mongoose.model('Instance', schema);
