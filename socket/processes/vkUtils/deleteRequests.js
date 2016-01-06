var utils = require('../../../modules/utils');
var executeCommand = require('../../../vkapi').executeCommand;

var deleteRequests = function (options, processes, credentials, callback, next) {

    callback(null, { // process msg
        cbType: 1,
        msg: utils.createMsg({msg: 'Удаление заявок'})
    });

    options.command = 'friends.deleteAllRequests';
    options.options = {};

    executeCommand(options, processes, credentials, callback, function (err, data) {
        if (err) {
            return next(err);
        } else {
            return next(null, data);
        }
    });
};

module.exports = deleteRequests;