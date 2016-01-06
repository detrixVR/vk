var processDohuya = require('./processDohuya');
var getItems = require('./getItems');
var utils = require('../../../modules/utils');
var async = require('async');
var executeCommand = require('../../../vkapi').executeCommand;

var deleteMessages = function (dialogs, options, processes, credentials, callback, next) {

    async.eachSeries(dialogs, function (item, yop) {

        var userId = item.message.user_id;
        var chatId = item.message.chat_id;
        var accountId = 275667666; //TODO!!

        if (chatId) {
            if (item.message.read_state) {

                options.command = 'messages.removeChatUser';
                options.options = {
                    chat_id: chatId,
                    user_id: accountId
                };

                executeCommand(options, processes, credentials, callback, function (err) {
                    if (err) {
                        return yop(err);
                    } else {
                        return yop();
                    }
                });

            } else {
                return yop();
            }
        } else if (userId) {

            options.command = 'messages.getHistory';
            options.options = {
                user_id: accountId,
                count: 1
            };

            executeCommand(options, processes, credentials, callback, function (err, data) {
                if (err) {
                    return yop(err);
                } else if (data.result &&
                    data.result.response &&
                    data.result.response.items) {

                    var count = data.result.response.count;

                    options.command = 'messages.deleteDialog';
                    options.options = {
                        user_id: userId,
                        count: 10000,
                        offset: 0
                    };

                    async.forever(function (back) {

                        executeCommand(options, processes, credentials, callback, function (err) {
                            if (err) {
                                return back(err);
                            } else {

                                options.options.offset += options.options.count;

                                if (options.options.offset >= count) {
                                    return back({
                                        next: true
                                    });
                                }
                                return back();
                            }
                        });

                    }, function (err) {
                        if (err.next) {
                            return yop();
                        } else {
                            return yop(err);
                        }
                    });
                } else {
                    return yop({error: 'error'});
                }
            });
        } else {
            return yop();
        }
    }, function (err) {
        if (err) {
            return next(err);
        } else {
            return next();
        }
    })
};

module.exports = deleteMessages;