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
    friendsCount: {
        type: Number,
        required: false
    },
    created: {
        type: Date,
        required: false,
        default: Date.now
    }
});

exports.PersonGrid = mongoose.model('PersonGrid', schema);
