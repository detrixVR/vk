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

        gid: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: false
        },
        screen_name: {
            type: String,
            required: false
        },
        is_closed: {
            type: Number,
            required: false
        },
        deactivated: {
            type: String,
            required: false
        },
        is_admin: {
            type: Number,
            required: false
        },
        admin_level: {
            type: Number,
            required: false
        },
        is_member: {
            type: Number,
            required: false
        },
        member_status: {
            type: Number,
            required: false
        },
        invited_by: {
            type: Number,
            required: false
        },
        type: {
            type: String,
            required: false
        },
        has_photo: {
            type: Number,
            required: false
        },
        photo_50: {
            type: String,
            required: false
        },
        photo_100: {
            type: String,
            required: false
        },
        photo_200: {
            type: String,
            required: false
        },
        ban_info: {
            type: Object,
            required: false,

            end_date : {
                type: Number,
                required: false
            },
            comment: {
                type: String,
                required: false
            }
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
        description:{
            type: String,
            required: false
        },
        wiki_page:{
            type: String,
            required: false
        },
        members_count:{
            type: Number,
            required: false
        },
        /*counters:{
            type: Object,
            required: false
        }*/
        start_date: {
            type: Mixed,
            required: false
        },
        finish_date: {
            type: Mixed,
            required: false
        },
        public_date_label: {
            type: String,
            required: false
        },
        can_post: {
            type: Number,
            required: false
        },
        can_see_all_posts: {
            type: Number,
            required: false
        },
        can_upload_doc: {
            type: Number,
            required: false
        },
        can_upload_video: {
            type: Number,
            required: false
        },
        can_create_topic: {
            type: Number,
            min: 0,
            max: 1,
            required: false
        },
        activity:{
            type: Mixed,
            required: false
        },
        status:{
            type: String,
            required: false
        },
        contacts: {
            type: Array,
            required: false
        },
        links: {
            type: Array,
            required: false
        },
        fixed_post: {
            type: Number,
            required: false
        },
        verified: {
            type: Number,
            required: false
        },
        site: {
            type: Number,
            required: false
        },
        main_album_id: {
            type: Number,
            required: false
        },
        is_favorite: {
            type: Number,
            required: false
        },
        is_hidden_from_feed: {
            type: Number,
            required: false
        },
        main_section: {
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

module.exports = mongoose.model('GroupListItem', schema);