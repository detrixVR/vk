var mongoose = require('../../mongodb');
var Schema = mongoose.Schema;

var schema = new Schema({
    username: {
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
    owner_id: {
        type: Number,
        required: false
    },
    album_id: {
        type: Number,
        required: false
    },
    user_id: {
        type: Number,
        required: false
    },
    photo_75: {
        type: String,
        required: false
    },
    created: {
        type: Date,
        required: false,
        default: Date.now
    }
});

exports.PhotoGrid = mongoose.model('PhotoGrid', schema);
