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
        required: true
    },
    status: {
        type: Number,
        required: false,
        default: 1
    },
    created: {
        type: Date,
        required: false,
        default: Date.now
    }
});

module.exports = mongoose.model('ProxyListItem', schema);