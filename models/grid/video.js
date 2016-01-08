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
    title: {
        type: String,
        required: false
    },
    duration: {
        type: Number,
        required: false
    },
    owner_id: {
        type: Number,
        required: false
    },
    access_key: {
        type: Object,
        required: false
    },
    photo_130: {
        type: String,
        required: false
    },
    created: {
        type: Date,
        required: false,
        default: Date.now
    }
});

exports.VideoGrid = mongoose.model('VideoGrid', schema);
