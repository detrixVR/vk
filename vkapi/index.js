var VK = require('vksdk'),
    config = require('../config'),
    utils = require('../modules/utils');


var vk = new VK({
    'language': 'ru',
    'secure': true,
    'version': '5.42'
});

function processError(error, callback) {

    var errorText = null;

    error.vkResponse = true;

    switch (error.error_code) {

        case 14:
            errorText = 'Требуется ввод кода с картинки (Captcha)';
            break;
        case 17:
            errorText = 'Требуется валидация пользователя';
            break;
        default :
            return callback(error);
    }
}

function executeCommand(options, processes, credentials, callback, next) {

    function processItem(back) {

        if (options.token)
            vk.setToken(options.token);

        if (options.proxy)
            vk.setProxy(options.proxy);


        vk.request(options.command, options.options, function (err, _o) {

            if(err) {
                return next(err);
            } else {
                console.log(_o);
                if (_o.error) {
                    processError(_o.error, function (err) {
                        return back(err);
                    })
                } else {
                    return back(null, {
                        msg: 'Команда выполнена без ошибок',
                        result: _o
                    });
                }
            }

        });
    }

    var curState = utils.getProcessState(processes, credentials);

    switch (curState) {
        case 1:

            //  var that = this;
            //  setTimeout(function () {
            processItem(function (err, data) {
                return next(err ? err : null, data);
            });
            //  }, 333);


            break;
        case 2:

            callback(null, {
                cbType: 3,
                msg: utils.createMsg({msg: 'Пауза'})
            });


            var d = null;
            var delay = function () {

                curState = utils.getProcessState(processes, credentials);

                if (curState === 2) {
                    d = setTimeout(delay, 100);
                } else {
                    clearTimeout(d);
                    if (curState !== 0) {

                        callback(null, { //start process
                            cbType: 2
                        });

                        processItem(function (err) {
                            return next(err ? err : null);
                        });
                    } else {
                        return next({
                            msg: utils.createMsg({msg: 'Процесс был прерван', type: 2})
                        });
                    }
                }
            };
            delay();
            break;
        case 0:
            return next({
                msg: utils.createMsg({msg: 'Процесс был прерван', type: 2})
            });
        default :
            return next();
    }
}

function justExecuteCommand(options, next) {

    console.log('justExecuteCommand');

    if (options.token)
        vk.setToken(options.token);

    if (options.proxy)
        vk.setProxy(options.proxy);


    vk.request(options.command, options.options, function (err, _o) {


        if(err) {
            return next(err);
        } else {
            //console.log(_o);
            if (_o.error) {
                processError(_o.error, function (err) {
                    return next(err);
                })
            } else {
                return next(null, {
                    msg: 'Команда выполнена без ошибок',
                    result: _o
                });
            }
        }
    });


}

module.exports = {
    executeCommand: executeCommand,
    justExecuteCommand: justExecuteCommand
};