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
    listName: {
        type: String,
        required: true,
        maxlength: 140,
        default: 'Основной'
    },
    content: {
        type: String,
        required: true
    },
    value: {
        type: Object,
        required: true,

        id: {
            type: Number,
            min: 1,
            required: true
        },
        album_id: {
            type: Number,
            required: false
        },
        owner_id: {
            type: Number,
            required: false
        },
        user_id: {
            type: Number,
            required: false
        },
        text: {
            type: String,
            required: false
        },
        date: {
            type: Number,
            required: false
        },
        sizes: {
            type: Array,
            required: false
        },
        photo_75: {
            type: String,
            required: false
        },
        photo_130: {
            type: String,
            required: false
        },
        photo_604: {
            type: String,
            required: false
        },
        photo_807: {
            type: String,
            required: false
        },
        photo_1280: {
            type: String,
            required: false
        },
        photo_2560: {
            type: String,
            required: false
        },
        width: {
            type: Number,
            required: false
        },
        height: {
            type: Number,
            required: false
        },
        access_key: {
            type: String,
            required: false
        }
    },
    created: {
        type: Date,
        required: false,
        default: Date.now
    }
});

module.exports = mongoose.model('PhotoListItem', schema);
