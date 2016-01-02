var VK = require('vksdk'),
    config = require('../config');

var vk = new VK({
    'language': 'ru',
    'secure': true
});

function executeCommand(options, callback) {

    if (options.token)
        vk.setToken(options.token);

    if (options.proxy)
        vk.setProxy(options.proxy);
    console.log('prerequest');

    vk.request(options.command,
        options.options,
        function (_o) {
            console.log('here');
            console.log(_o);
            if (_o.error) {
                processError(req, _o.error, function (err) {
                    return callback(err);
                })
            } else {
                return callback(null, {
                    msg: 'Команда выполнена без ошибок',
                    result: _o
                });
            }
        });
}

module.exports.executeCommand = executeCommand;