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
    created: {
        type: Date,
        required: false,
        default: Date.now
    }
});

exports.PostGrid = mongoose.model('PostGrid', schema);
