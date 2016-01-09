var justExecuteCommand = require('../../vkapi').justExecuteCommand;
var utils = require('../../../modules/utils');

var sendMessage = function (options, callback) {


    options.text = utils.processPart(options.text);

    var executeOptions = {
        command: 'messages.send',
        proxy: options.proxy,
        token: options.token,
        options: {
            user_id: options.user_id,
            message: options.text,
            attachment: options.attachment
        }
    };

    justExecuteCommand(executeOptions, function (err, data) {
        if (err) {
            return callback(err);
        } else if (data &&
            data.result &&
            data.result.response) {

            console.log(data);
            return callback(null, data.result.response);
        } else {
            return callback({error: 'error'});
        }
    });



};

module.exports = sendMessage;