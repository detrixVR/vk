var mongoose = require('../mongodb');
var Schema = mongoose.Schema;

var schema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        default: ''
    },
    email: {
        type: String,
        required: false,
        default: ''
    },
    deposit: {
        type: Number,
        required: false,
        default: 0
    },
    lists: {
        type: Array,
        required: false,
        default: []
    },
    settings: {
        forgotEmail: {
            type: String,
            required: false,
            default: ''
        },
        userAgent: {
            type: String,
            required: false,
            default: ''
        },
        myApplication: {
            type: String,
            required: false,
            default: ''
        },
        useServerProxies: {
            type: Boolean,
            required: false,
            default: false
        },
        captchaServiceKey: {
            type: String,
            required: false,
            default: ''
        },
        manualCaptchaEnter: {
            type: Boolean,
            required: false,
            default: true
        },
        oneAccountOneProxy: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    created: {
        type: Date,
        required: false,
        default: Date.now
    }
});

exports.User = mongoose.model('User', schema);
