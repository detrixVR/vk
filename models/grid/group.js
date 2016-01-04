var mongoose = require('../../mongodb');
var Schema = mongoose.Schema;

var schema = new Schema({
    username: {
        type: String,
        required: true
    },
    accountId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: false,
        default:''
    },
    id: {
        type: Number,
        required: false
    },
    name: {
        type: String,
        required: false
    },
    members_count: {
        type: Number,
        required: false
    },
    screen_name: {
        type: String,
        required: false
    },
    type: {
        type: String,
        required: false
    },
    verified: {
        type: Number,
        required: false,
        default: 0
    },
    photo_50: {
        type: String,
        required: false
    },
    created: {
        type: Date,
        required: false,
        default: Date.now
    }
});

exports.GroupGrid = mongoose.model('GroupGrid', schema);
