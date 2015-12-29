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
    token: {
        type: String,
        required: false
    },
    proxy: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    pass: {
        type: String,
        required: false
    },
    currentForm: {
        type: Object,
        required: false
    },
    cookieString: {
        type: String,
        required: false
    },
    userAgent: {
        type: String,
        required: false
    },
    myApplication: {
        type: String,
        required: false
    },
    nextUrl: {
        type: String,
        required: false
    },
    nextMethod: {
        type: String,
        required: false
    },
    can_write_private_message: {
        type: Number,
        required: false
    },
    first_name: {
        type: String,
        required: false
    },
    last_name: {
        type: String,
        required: false
    },
    sex: {
        type: Number,
        required: false
    },
    accountId: {
        type: Number,
        required: false
    },
    photo_50: {
        type: String,
        required: false
    },
    friendsCount: {
        type: Number,
        required: false
    },
    groupsCount: {
        type: Number,
        required: false
    },
    created: {
        type: Date,
        required: false,
        default: Date.now
    }
});

exports.AccountGrid = mongoose.model('AccountGrid', schema);
