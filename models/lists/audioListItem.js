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
        maxlength: 140,
        required: true,
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
        owner_id: {
            type: Number,
            required: false
        },
        artist: {
            type: String,
            maxlength: 250,
            required: false
        },
        title: {
            type: String,
            maxlength: 250,
            required: false
        },
        name: {
            type: String,
            maxlength: 250,
            required: false
        },
        duration: {
            type: Number,
            min: 1,
            required: false
        },
        url: {
            type: String,
            required: false
        },
        lyrics_id: {
            type: Number,
            min: 1,
            required: false
        },
        album_id: {
            type: Number,
            min: 1,
            required: false
        },
        genre_id: {
            type: Number,
            min: 1,
            required: false
        },
        date: {
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

module.exports = mongoose.model('AudioListItem', schema);