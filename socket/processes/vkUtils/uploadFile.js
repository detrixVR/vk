var utils = require('../../../modules/utils');
var async = require('async');
var justExecuteCommand = require('../../../vkapi').justExecuteCommand;
var request = require('request');
var FormData = require('form-data');
var fs = require('fs');

var uploadFile = function (options, callback) {

    var firstRequest = null;
    var secondRequest = null;
    var string = null;
    var executeOptions = null;

    switch (options.type) {
        case 0:
            firstRequest = 'photos.getUploadServer';
            secondRequest = 'photos.save';

            executeOptions = {
                command: firstRequest,
                proxy: options.proxy,
                token: options.token,
                options: {
                    album_id: options.album_id,
                    group_id: options.group_id
                }
            };

            string = 'Загрузка фотографий в альбом пользователя';
            break;
        case 1:
            firstRequest = 'photos.getWallUploadServer';
            string = 'Загрузка фотографий на стену пользователя';
            break;
        case 2:
            firstRequest = 'photos.getOwnerPhotoUploadServer';
            string = 'Загрузка главной фотографии на страницу пользователя или сообщества';
            break;
        case 3:
            firstRequest = 'photos.getMessagesUploadServer';
            string = 'Загрузка фотографии в личное сообщение';
            break;
        case 4:
            firstRequest = 'audio.getUploadServer';
            string = 'Загрузка аудиозаписей';
            break;
        case 5:
            firstRequest = 'video.save';
            string = 'Загрузка видеозаписей';
            break;
        case 6:
            firstRequest = 'docs.getUploadServer';
            string = 'Загрузка документов';
            break;
        default:
            return callback({error: 'error'});
    }


    async.waterfall([function (iteration) {

        justExecuteCommand(executeOptions, function (err, data) {
            if (err) {
                return iteraion(err);
            } else if (data &&
                data.result &&
                data.result.response) {

                console.log(data);
                return iteration(null, data.result.response);
            } else {
                return iteration({error: 'error'});
            }
        });


    }, function (response, iteration) {

        var form = new FormData();

        var data = options.memStream.toString();


        /*form.append('file1', data, {
         filename: 'unicycle.jpg',
         contentType: 'image/jpg',
         knownLength: data.length
         });*/

        var formData = {
            file1: options.buffer//options.memStream.toString()//fs.createReadStream(__dirname + '../../../../public/images/camera_50.png')//options.memStream.toString(),
            //  my_file: fs.createReadStream(__dirname + '/unicycle.jpg'),
        };



        var reque = request.post(response.upload_url, function (err, resp, body) {
            if (err) {
                console.log('Error!');
            } else {
                console.log('URL: ' + body);
            }
        });
        var form = reque.form();
        form.append('file', options.buffer, {
            filename: 'CVffSTvWIAAQ46p.jpg',
            contentType: 'image/jpeg'
        });





        /*request.post({url: response.upload_url, formData: form}, function (err, httpResponse, body) {
         if (err) {
         //return console.error('upload failed:', err);
         return iteration(err);
         }
         console.log('Upload successful!  Server responded with:', body);
         return iteration(null, body);
         });*/

        /* form.submit(response.upload_url, function(err, res) {
         if (err) throw err;
         console.log('Done');
         });*/

    },

        function (body, iteration) {

            /* body.album_id = 226515222;

             console.log()*/
            var body = JSON.parse(body);
            executeOptions.command = 'photos.save';

            body.album_id = 226515222;
            // body.photos_list = body;


            executeOptions.options = body;

            justExecuteCommand(executeOptions, function (err, data) {
                if (err) {
                    return iteration(err);
                } else if (data &&
                    data.result &&
                    data.result.response) {

                    console.log(data);
                    return iteration(null, data.result.response);
                } else {
                    return iteration({error: 'error'});
                }
            });
        }

    ], function (err) {
        return callback(err ? err : null);
    });


};

module.exports = uploadFile;