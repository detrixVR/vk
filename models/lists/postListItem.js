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
            required: true
        },
        owner_id: {
            type: Number,
            required: false
        },
        from_id: {
            type: Number,
            required: false
        },
        date: {
            type: Number,
            required: false
        },
        text: {
            type: String,
            required: false
        },
        reply_owner_id: {
            type: Number,
            required: false
        },
        reply_post_id: {
            type: Number,
            required: false
        },
        friends_only: {
            type: Number,
            required: false
        },
        /*comments: {

        },
        likes: {

        },
        reposts: {

        },*/
        post_type: {
            type: String,
            required: false
        },
        /*post_source: {

        },
        attachments: {

        },
        geo: {

        },*/
        signer_id: {
            type: Number,
            required: false
        },
        /*copy_history: {

        },*/
        can_pin: {
            type: Number,
            required: false
        },
        is_pinned: {
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

module.exports = mongoose.model('PostListItem', schema);
