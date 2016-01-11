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
        first_name: {
            type: String,
            required: true
        },
        last_name: {
            type: String,
            required: true
        },
        /*deactivated:{

         },
         hidden:{

         },*/
        photo_50: {
            type: String,
            required: false
        },
        verified: {
            type: Number,
            required: false
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
        sex: {
            type: Number,
            required: false
        },
        bdate: {
            type: String,
            required: false
        },
        /*city:{

         },
         country:{

         },
         home_town:{

         },
         has_photo:{

         },
         photo_50:{

         },
         photo_100:{

         },
         photo_200_orig:{

         },
         photo_200:{

         },
         photo_400_orig:{

         },
         photo_max:{

         },
         photo_max_orig:{

         },
         online:{

         },
         lists:{

         },*/
        domain: {
            type: String,
            required: false
        },
        /*has_mobile:{

         },
         contacts:{

         },
         site:{

         },

         education:{

         },

         universities:{

         },

         schools:{

         },
         status:{

         },
         last_seen:{

         },
         followers_count:{

         },
         common_count:{

         },
         counters:{

         },
         occupation:{

         },*/
        nickname: {
            type: String,
            required: false
        },
        /*relatives:{

         },*/
        relation: {
            type: Number,
            required: false
        },
        /*personal:{

         },
         connections:{

         },
         exports:{

         },*/
        wall_comments: {
            type: Number,
            required: false
        },
        /*activities:{

         },
         interests:{

         },
         music:{

         },
         movies:{

         },
         tv:{

         },

         books:{

         },

         games:{

         },

         about:{

         },

         quotes:{

         },*/
        can_post: {
            type: Number,
            required: false
        },
        can_see_all_posts: {
            type: Number,
            required: false
        },
        can_see_audio: {
            type: Number,
            required: false
        },
        can_write_private_message: {
            type: Number,
            required: false
        },
        can_send_friend_request: {
            type: Number,
            required: false
        },
        /*is_favorite:{

         },
         is_hidden_from_feed:{

         },
         timezone:{

         },
         screen_name:{

         },
         maiden_name:{

         },
         crop_photo:{

         },
         is_friend:{

         },
         friend_status:{

         },
         career:{

         },
         military:{

         },*/
        blacklisted: {
            type: Number,
            required: false
        },
        blacklisted_by_me: {
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
