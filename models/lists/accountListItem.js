var mongoose = require('../../mongodb');
var Schema = mongoose.Schema;

var schema = new Schema({
    username: {
        type: String,
        required: true
    },
    listName: {
        type: String,
        maxlength: 140,
        required: true,
        default: 'Основной'
    },
    content: {
        type: String,
        required: false,
        default: ''
    },
    status: {
        type: Number,
        required: false,
        default: 1
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
    value: {
        type: Object,
        required: true,

        id: {
            type: Number,
            required: true
        },
        first_name: {
            type: String,
            required: true
        },
        last_name: {
            type: String,
            required: true
        },
        photo_50: {
            type: String,
            required: false
        },
        verified: {
            type: Number,
            required: false
        },
        city: {
            type: Object,
            required: false,

            id: {
                type: Number,
                required: false
            },
            title: {
                type: String,
                required: false
            }
        },
        country: {
            type: Object,
            required: false,

            id: {
                type: Number,
                required: false
            },
            title: {
                type: String,
                required: false
            }
        },
        sex: {
            type: Number,
            required: false
        },
        bdate: {
            type: String,
            required: false
        },
        domain: {
            type: String,
            required: false
        },
        nickname: {
            type: String,
            required: false
        },
        relation: {
            type: Number,
            required: false
        }
    },
    created: {
        type: Date,
        required: false,
        default: Date.now
    }
});

module.exports = mongoose.model('AccountListItem', schema);
