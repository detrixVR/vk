function ruslat(str) {
    var lat = new Array('q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '"', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', "'", 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9');
    var rus = new Array('й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ', 'ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', 'Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З', 'Х', 'Ъ', 'Ф', 'Ы', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж', 'Э', 'Я', 'Ч', 'С', 'М', 'И', 'Т', 'Ь', 'Б', 'Ю', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9');
    var word = ''
    for (var i = 0, L = str.length; i < L; i++) {
        var letter = str[i];
        var bool = false;
        for (var j = 0, L = rus.length; j < L; j++) {
            if (rus[j] == letter) {
                word += lat[j];
                bool = true;
            }
        }
        if (!bool) {
            word += str.substr(i, 1);
        }
    }
    return word ? word : str;
}

function validateURL(textval) {
    var urlregex = new RegExp(
        "^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
    return urlregex.test(textval);
}

function isInt(n){
    return !isNaN(+n);
}

function isFloat(n){
    return n === Number(n) && n % 1 !== 0;
}

function validateSettings(settings, validationModel) {
    var errors = [];
    for (var k in validationModel) {
        if (settings.hasOwnProperty(k) && settings[k].hasOwnProperty('value')) {
            var result = validationModel[k].validate(settings[k].value);
            if (result) {
                errors.push({
                    text: validationModel[k].name + ' - ' + result,
                    field: k
                });
            }
        } else {
           // console.log(k)
            errors.push({
                text: 'Необходим параметр ' + validationModel[k].name
            });
        }
    }

    var text = 'Неверные параметры:<br>';
    errors.forEach(function(item){
        text += '<span class="small">'+item.text+'</small><br>';
    });

    var badFields = [];
    errors.forEach(function(item){
        badFields.push(item.field);
    });

    return errors.length ? {
        msg: text,
        badFields: badFields
    } : null;
}

function validateIPaddress(ipaddress) {

    function validateNum(input, min, max) {
        var num = +input;
        return num >= min && num <= max && input === num.toString();
    }

    var parts = ipaddress.split(":");
    var ip = parts[0].split(".");
    var port = parts[1];
    return validateNum(port, 1, 65535) &&
        ip.length == 4 &&
        ip.every(function (segment) {
            return validateNum(segment, 0, 255);
        });
}

function parseForm(form) {
    var formObject = {};
    var action_index = form.indexOf('action="');
    var image_index = form.indexOf('<img ');
    var image_url = (image_index > -1) ? form.substring(image_index) : '';
    if (image_url) {
        image_url = image_url.substring(image_url.indexOf('src="') + 5);
        image_url = image_url.substring(0, image_url.indexOf('"'));
        formObject['image_url'] = image_url;
    }
    var action = '';
    if (action_index > -1) {
        action = form.substring(action_index + 8);
        action = action.substring(0, action.indexOf('"'));
    }
    formObject['action'] = action;
    var index = form.indexOf('<input');
    while (index > -1) {
        form = form.substring(index + 6);
        var name_index = form.indexOf('name="');
        if (name_index > -1) {
            var name = form.substring(name_index + 6);
            name = name.substring(0, name.indexOf('"'));
            var value_index = form.indexOf('value="');
            var value = '';
            if (value_index > -1) {
                value = form.substring(value_index + 7);
                value = value.substring(0, value.indexOf('"'));
            }
            formObject[name] = value;
        }
        index = form.indexOf('<input');
    }

    return formObject;
}

function processError(error) {

    var notify = false;
    var msg = 'Ошибка сервера';
    var arg = 0;
    var status = 200;

    console.error("here");
    console.error(error);

    switch (error.arg) {
        case 1:
            msg = 'Произошла неизвестная ошибка';
            break;
        case 2:
            msg = 'Приложение выключено';
            break;
        case 3:
            msg = 'Передан неизвестный метод';
            break;
        case 4:
            msg = 'Неверная подпись';
            break;
        case 5:
            msg = 'Авторизация пользователя не удалась';
            break;
        case 6:
            msg = 'Слишком много запросов в секунду';
            break;
        case 7:
            msg = 'Нет прав для выполнения этого действия';
            break;
        case 8:
            msg = 'Неверный запрос';
            break;
        case 9:
            msg = 'Слишком много однотипных действий';
            break;
        case 10:
            msg = 'Произошла внутренняя ошибка сервера';
            break;
        case 11:
            msg = 'В тестовом режиме приложение должно быть выключено или пользователь должен быть залогинен';
            break;
        case 14:
            msg = 'Требуется ввод кода с картинки (Captcha)';
            break;
        case 15:
            msg = 'Доступ запрещён';
            break;
        case 16:
            msg = 'Требуется выполнение запросов по протоколу HTTPS, т.к. пользователь включил настройку, требующую работу через безопасное соединение';
            break;
        case 17:
            msg = 'Требуется валидация пользователя';
            break;
        case 20:
            msg = 'Данное действие запрещено для не Standalone приложений';
            break;
        case 21:
            msg = 'Данное действие разрешено только для Standalone и Open API приложений';
            break;
        case 23:
            msg = 'Метод был выключен';
            break;
        case 24:
            msg = 'Требуется подтверждение со стороны пользователя';
            break;
        case 100:
            msg = 'Один из необходимых параметров был не передан или неверен';
            break;
        case 101:
            msg = 'Неверный API ID приложения';
            break;
        case 113:
            msg = 'Неверный идентификатор пользователя';
            break;
        case 150:
            msg = 'Неверный timestamp';
            break;
        case 200:
            msg = 'Доступ к альбому запрещён';
            break;
        case 201:
            msg = 'Доступ к аудио запрещён';
            break;
        case 203:
            msg = 'Доступ к группе запрещён';
            break;
        case 300:
            msg = 'Альбом переполнен';
            break;
        case 500:
            msg = 'Действие запрещено. Вы должны включить переводы голосов в настройках приложения';
            break;
        case 600:
            msg = 'Нет прав на выполнение данных операций с рекламным кабинетом';
            break;
        case 603:
            msg = 'Произошла ошибка при работе с рекламным кабинетом';
            break;

    }

    if (error.notify) {
        notify = true;
        msg = error.msg;
        status = 400;
    } else {
        status = 500;
        if (error.code === 'ETIMEDOUT') {
            status = 200;
            arg = 8;
            msg = 'Превышен интервал ожидания ответа сервера'
        } else if (error.code === 'ECONNRESET') {
            status = 200;
            arg = 8;
            msg = 'Соединение прервано'
        } else if (error.code === 'ECONNREFUSED') {
            status = 200;
            arg = 8;
            msg = 'Соединение не удалось'
        }
    }

    return {
        notify: notify,
        arg: arg,
        status: status,
        msg: msg
    }
}

function getLocation(href) {
    var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
            protocol: match[1],
            host: match[2],
            hostname: match[3],
            port: match[4],
            pathname: match[5],
            search: match[6],
            hash: match[7]
        }
}

function validateIPaddress(ipaddress) {

    function validateNum(input, min, max) {
        var num = +input;
        return num >= min && num <= max && input === num.toString();
    }

    var parts = ipaddress.split(":");
    var ip = parts[0].split(".");
    var port = parts[1];
    return validateNum(port, 1, 65535) &&
        ip.length == 4 &&
        ip.every(function (segment) {
            return validateNum(segment, 0, 255);
        });
}

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}

function getCase(_number, _case1, _case2, _case3) {
    var base = _number - Math.floor(_number / 100) * 100;
    var result;

    if (base > 9 && base < 20) {
        result = _case3;

    } else {
        var remainder = _number - Math.floor(_number / 10) * 10;

        if (1 == remainder) result = _case1;
        else if (0 < remainder && 5 > remainder) result = _case2;
        else result = _case3;
    }

    return result;
}

function createMsg(options) {

    var defOptions = {
        time: Date.now(),
        msg: 'text',
        type: 0,
        clear: false
    };

    return extend(defOptions, options);
};

module.exports = {
    ruslat: ruslat,
    processError: processError,
    validateURL: validateURL,
    parseForm: parseForm,
    getLocation: getLocation,
    validateIPaddress: validateIPaddress,
    extend: extend,
    getCase: getCase,
    createMsg: createMsg,
    validateSettings: validateSettings,
    isInt: isInt,
    isFloat: isFloat,
};