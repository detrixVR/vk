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
        required: false,
        default: ''
    },
    value: {
        type: Object,
        required: true,

        id: {
            type: Number,
            required: true
        },
        owner_id: {
            type: Number,
            required: false
        },
        title: {
            type: String,
            required: false
        },
        duration: {
            type: Number,
            required: false
        },
        date: {
            type: Number,
            required: false
        },
        adding_date: {
            type: Number,
            required: false
        },
        views: {
            type: Number,
            required: false
        },
        comments: {
            type: Number,
            required: false
        },
        photo_130: {
            type: String,
            required: false
        },
        photo_320: {
            type: String,
            required: false
        },
        photo_640: {
            type: String,
            required: false
        },
        photo_800: {
            type: String,
            required: false
        },
        files: {
            type: Object,
            required: false,

            external: {
                type: String,
                required: false
            }
        },
        player: {
            type: String,
            required: false
        },
        processing: {
            type: Number,
            required: false
        },
        live: {
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

module.exports = mongoose.model('VideoListItem', schema);
