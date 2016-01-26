"use strict";

module.exports.get = function (req, res) {
    res.render('workplace/messaging', {
        user: req.user,
        page: 'messaging'
    });
};

var justExecuteCommand = require('vkapi').justExecuteCommand;

var url = require('url');

module.exports.post = function (req, res) {

    let urlParts = url.parse(req.url, true);
    let query = urlParts.query;

    let account = {
        token: 'c8d7eee470f0fe3714263ab5083f462959c40399f17ebcaed9a0e1d5d41a04f755aa458243721a9ef0feb',
        proxy: null
    };

    let options = {
        token: account.token,
        proxy: account.proxy,
        command: 'execute',
        options: {}
    };

    switch (query.type) {
        case 'message':
            options.command = 'messages.send';
            options.options = {
                offset: req.body.offset,
                message: req.body.message,
                user_id: req.body.user_id
            };
            break;
        case 'dialog':
            options.command = 'messages.getDialogs';
            options.options = {
                offset: req.body.offset,
                count: 20
            };
            break;
        case 'history':
            options.command = 'messages.getHistory';
            options.options = {
                user_id: req.body.user_id,
                offset: req.body.offset,
                count: 20
            };
            break;
        default :
            return res.status(500).json({error: 'Неверные параметры'});
    }


    justExecuteCommand(options, function (err, data) {

        if (err) {
            console.error(err);
            res.status(500).json({error: 'error'});
        } else {
            res.status(200).json(data.result);
        }

    });


};


let async = require('async');
let http = require('http');
let _ = require('underscore');

module.exports.put = function (req, res) {

    async.waterfall([
        function (callback) {

            let account = {
                token: 'c8d7eee470f0fe3714263ab5083f462959c40399f17ebcaed9a0e1d5d41a04f755aa458243721a9ef0feb',
                proxy: null
            };

            let options = {
                token: account.token,
                proxy: account.proxy,
                command: 'messages.getLongPollServer',
                options: {}
            };

            justExecuteCommand(options, function (err, data) {

                return callback(err ? err : null, data);

            });
        }, function (data, callback) {

            console.log(data);

            let queryOpts = data.result.response;

            async.forever(function (next) {

                let query = url.parse(`http://${queryOpts.server}?act=a_check&key=${queryOpts.key}&ts=${queryOpts.ts}&wait=25&mode=2`);

                http.get(url.parse(query), function (res) {

                    var apiResponse = new String();
                    res.setEncoding('utf8');

                    res.on('data', function (chunk) {
                        apiResponse += chunk;
                    });

                    res.on('end', function () {

                        let o = null;

                        try {
                            o = JSON.parse(apiResponse);
                        } catch (e) {
                            return next(e);
                        }

                        console.log(o);

                        if (o && o.updates) {
                            if (o.updates.length) {
                                _.forEach(o.updates, function (item) {
                                    switch (item[0]) {

                                        case 4:
                                            let message = {
                                                message_id: item[1],
                                                flags: item[2],
                                                from_id: item[3],
                                                timestamp: item[4],
                                                subject: item[5],
                                                text: item[6],
                                                attachments: item[7]
                                            };
                                            console.log(`Добавление нового сообщения в чате с ${message.from_id}`);
                                            break;
                                        case 8:
                                            console.log(`Друг ${item[1]} стал онлайн`);
                                            break;
                                        case 9:
                                            console.log(`Друг ${item[1]} стал оффлайн`);
                                            break;
                                        case 61:
                                            console.log(`Пользователь ${item[1]} начал набирать текст в диалоге`);
                                            break;
                                        case 80:
                                            console.log(`Количество непрочитанных сообщений - ${item[1]}`);
                                            break;


                                    }
                                })
                            }
                        }

                        queryOpts.ts = o.ts;

                        next();

                    });


                }).on('error', function (err) {
                    return next(err);
                });

            }, function (err) {

                return callback(err);
            });


        }
    ], function (err) {
        if (err) {
            console.error(err);
        }
    });

    res.status(200).json({msg: 'OK'});

};