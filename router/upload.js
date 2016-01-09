"use strict";

var uploadFile = require('../socket/processes/vkUtils/uploadFile');
var async = require('async');
var utils = require('../modules/utils');


module.exports.post = function (req, res) {


    var ids = req.body.ids;
    var sio = req.sio;

    if (!utils.isArray(ids)) {
        ids = [ids];
    }
    console.log(req.files.length);

    let i = 0;

    async.each(req.files, function (item, callback) {

        var options = {
            token: 'c8d7eee470f0fe3714263ab5083f462959c40399f17ebcaed9a0e1d5d41a04f755aa458243721a9ef0feb',
            proxy: null,
            type: 0,
            album_id: 226515222,
            buffer: item.buffer,
            itemId: ids[i],
            user: req.user,
            sio: sio
        };

        uploadFile(options, function (err) {
            return callback(err ? err : null);
        });

        i++;

    }, function (err) {
        if (err) {
            res.status(500).send('error');
        } else {
            res.end('ok');
        }

    });


    res.end('ok');
};

module.exports.get = function (req, res) {
    res.render('upload', {
        user: req.user,
        page: 'upload'
    })
};