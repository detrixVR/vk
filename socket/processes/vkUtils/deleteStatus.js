var utils = require('../../../modules/utils');
var executeCommand = require('../../../vkapi').executeCommand;

var deleteStatus = function (options, processes, credentials, callback, next) {

    callback(null, { // process msg
        cbType: 1,
        msg: utils.createMsg({msg: 'Очистка статуса'})
    });

    options.command = 'status.set';
    options.options = {
        text: ''
    };

    executeCommand(options, processes, credentials, callback, function (err, data) {
        if (err) {
            return next(err);
        } else {
            callback(null, { // process msg
                cbType: 1,
                msg: utils.createMsg({msg: 'Статус очищен'})
            });

            return next(null, data);
        }
    });
};

module.exports = deleteStatus;