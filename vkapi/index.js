var VK = require('vksdk'),
    config = require('../config');

var vk = new VK({
    'language': 'ru',
    'secure': true
});

function processError(error, callback) {
    var errorText = null;

    switch (error.error_code) {
        /*case 17:
         console.log(error.error_msg);
         Browser(req, {
         method: 'GET',
         url: error.redirect_uri,
         headers: {
         'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.125 Safari/537.36',
         cookies: req.session.cookieString
         }
         }, req.session.email, req.session.pass, function (err) {
         if (err.arg === 2) {
         //получили новый токен
         console.log('Получили новый токен')
         }
         return callback(err);
         });
         break;*/
        case 1:
            errorText = 'Произошла неизвестная ошибка';
            break;
        case 2:
            errorText = 'Приложение выключено';
            break;
        case 3:
            errorText = 'Передан неизвестный метод';
            break;
        case 4:
            errorText = 'Неверная подпись';
            break;
        case 5:
            errorText = 'Авторизация пользователя не удалась';
            break;
        case 6:
            errorText = 'Слишком много запросов в секунду';
            break;
        case 7:
            errorText = 'Нет прав для выполнения этого действия';
            break;
        case 8:
            errorText = 'Неверный запрос';
            break;
        case 9:
            errorText = 'Слишком много однотипных действий';
            break;
        case 10:
            errorText = 'Произошла внутренняя ошибка сервера';
            break;
        case 11:
            errorText = 'В тестовом режиме приложение должно быть выключено или пользователь должен быть залогинен';
            break;
       /* case 13:
            errorText = error.error_msg;
            break;*/
        case 14:
            errorText = 'Требуется ввод кода с картинки (Captcha)';
            break;
        case 15:
            errorText = 'Доступ запрещён';
            break;
        case 16:
            errorText = 'Требуется выполнение запросов по протоколу HTTPS, т.к. пользователь включил настройку, требующую работу через безопасное соединение';
            break;
        case 17:
            errorText = 'Требуется валидация пользователя';
            break;
        case 20:
            errorText = 'Данное действие запрещено для не Standalone приложений';
            break;
        case 21:
            errorText = 'Данное действие разрешено только для Standalone и Open API приложений';
            break;
        case 23:
            errorText = 'Метод был выключен';
            break;
        case 24:
            errorText = 'Требуется подтверждение со стороны пользователя';
            break;
        case 100:
            errorText = 'Один из необходимых параметров был не передан или неверен';
            break;
        case 101:
            errorText = 'Неверный API ID приложения';
            break;
        case 113:
            errorText = 'Неверный идентификатор пользователя';
            break;
        case 150:
            errorText = 'Неверный timestamp';
            break;
        case 200:
            errorText = 'Доступ к альбому запрещён';
            break;
        case 201:
            errorText = 'Доступ к аудио запрещён';
            break;
        case 203:
            errorText = 'Доступ к группе запрещён';
            break;
        case 300:
            errorText = 'Альбом переполнен';
            break;
        case 500:
            errorText = 'Действие запрещено. Вы должны включить переводы голосов в настройках приложения';
            break;
        case 600:
            errorText = 'Нет прав на выполнение данных операций с рекламным кабинетом';
            break;
        case 603:
            errorText = 'Произошла ошибка при работе с рекламным кабинетом';
            break;
        default:
            errorText = 'Neizvestnaya oshibka';
            break;
    }

    return callback({
        arg: 5,
        msg: errorText || error.error_msg
    });
}

function executeCommand(options, callback) {

    if (options.token)
        vk.setToken(options.token);

    if (options.proxy)
        vk.setProxy(options.proxy);


    console.log('prerequest');
  //  console.log(options.options);

    vk.request(options.command,
        options.options,
        function (_o) {
            console.log(_o);
            if (_o.error) {
                processError(_o.error, function (err) {
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