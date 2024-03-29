"use strict";

var Account = require('../models/grid/account').AccountGrid;

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

function isInt(n) {
    return !isNaN(+n);
}

function isFloat(n) {
    return n === Number(n) && n % 1 !== 0;
}

function getAccountByCredentials(ceredentials, callback) {
    Account.findOne({
        username: ceredentials.user,
        accountId: ceredentials.accountId
    }, function (err, account) {
        return callback(err ? err : null, account);
    })
}

function validateSettings(settings, validationModel) {
    var errors = [];

    if (!validationModel || !settings) {
        return {
            msg: 'В корне неверные настройки'
        }
    }

    for (var k in validationModel) {

        if (validationModel[k].hasOwnProperty('required')) {

            if (validationModel[k].required(settings)) {

                if (!settings.hasOwnProperty(k) || !settings[k].hasOwnProperty('value')) {
                    errors.push({
                        text: 'Необходим параметр ' + validationModel[k].name
                    });
                }
            }

        } else if (!settings.hasOwnProperty(k) || !settings[k].hasOwnProperty('value')) {
            errors.push({
                text: 'Необходим параметр ' + validationModel[k].name
            });
        }
    }

    if (!errors.length) {
        for (var k in validationModel) {
            if (settings[k]) {
                var result = validationModel[k].validate(settings[k].value, settings);
                if (result) {
                    errors.push({
                        text: validationModel[k].name + ' - ' + result,
                        field: k
                    });
                }
            }
        }
    }

    var text = 'Неверные параметры:<br>';
    errors.forEach(function (item) {
        text += '<span class="small">' + item.text + '</span><br>';
    });

    var badFields = [];
    errors.forEach(function (item) {
        if (item.field)
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

function getProcessState(processes, credentials) {

    for (var i = 0; i < processes.length; i++) {
        if (processes[i].username === credentials.username &&
            processes[i].accountId === credentials.accountId &&
            processes[i].processId === credentials.processId) {
            return processes[i].state;
        }
    }

    return -1;
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
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isArray(vArg) {
    return Object.prototype.toString.call(vArg) === "[object Array]";
}

function shuffleArray(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function processPart(part) {

    function getClosestScopeIndex(part, from, scope, antiscope) {
        var k = 0;
        for (var i = from; i < part.length; i++) {
            if (part[i] === scope) {
                k++;
            } else if (part[i] === antiscope) {
                if (k)
                    k--;
                else
                    return i;
            }
        }
        return i;
    }

    var output = '';
    var inner = '';
    var t = -1;
    var variants = null;

    for (var i = 0; i < part.length; i++) {
        if (part[i] === '\\') {
            i += 1;
            output += part[i];
        } else if (part[i] === '{' ||
            part[i] === '[') {

            var inScope = part[i];
            var outScope = (inScope === '{' ? '}' : ']');
            i++;
            t = getClosestScopeIndex(part, i, inScope, outScope);
            if (t > -1) {
                inner = processPart(part.substring(i, t));
                variants = inner.split('|');
                variants.forEach(function (item) {
                    item = item.trim();
                });
                var k = getRandomInt(0, variants.length - 1);

                if (inScope === '[') {
                    var separator = '';
                    var index = variants[0].indexOf('+');
                    if (index > -1) {
                        index++;
                        separator = variants[0].substring(index, variants[0].indexOf('+', index));
                    }
                    variants[0] = variants[0].replace('+' + separator + '+', '').trim();
                    variants = shuffleArray(variants);
                    output += variants.join((separator || ' '));
                } else {
                    output += variants[k];
                }
                i = t++;
            }
        } else {
            output += part[i];
        }
    }

    return output;
}

function validateDbId(id) {
    return /^[a-fA-F0-9]{24}$/.test(id);
}

function processAnyError(err) {

    console.error(err);

    if (err.vkResponse) {

        console.error('vkResponse');

        var errorText = null;

        switch (error.error_code) {
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
                errorText = 'Неизвестная ошибка (VK REQUEST)';
                break;
        }

        return {
            msg: errorText
        }
    }

    return {
        msg: 'Произошла ошибка'
    }

}

var _parseJSON = (JSON && JSON.parse) ? function (obj) {
    try {
        return JSON.parse(obj);
    } catch (e) {
        return eval('(' + obj + ')');
    }
} : function (obj) {
    return eval('(' + obj + ')');
};

var _trim = function (text) {
    return (text || '').replace(/^\s+|\s+$/g, '');
};

function _intval(value) {
    if (value === true) return 1;
    return parseInt(value) || 0;
}
function _floatval(value) {
    if (value === true) return 1;
    return parseFloat(value) || 0;
}
function positive(value) {
    value = _intval(value);
    return value < 0 ? 0 : value;
}

var _parseRes = function (answer) {
    for (var i = answer.length - 1; i >= 0; --i) {
        var ans = answer[i].toString();
        if (ans.substr(0, 2) == '<!') {
            var from = ans.indexOf('>');
            var type = ans.substr(2, from - 2);
            ans = ans.substr(from + 1);
            switch (type) {
                case 'json' :
                    answer[i] = _parseJSON(ans);
                    break;
                case 'int'  :
                    answer[i] = _intval(ans);
                    break;
                case 'float':
                    answer[i] = _floatval(ans);
                    break;
                case 'bool' :
                    answer[i] = _intval(ans) ? true : false;
                    break;
                case 'null' :
                    answer[i] = null;
                    break;
            }
        }
    }
};

function processVkResponse(text) {

    text = text.replace(/^<!--/, '').replace(/-<>-(!?)>/g, '--$1>');

    if (!_trim(text).length) {
        console.error('Response length error');
        return [];
    }

    var answer = text.split('<!>');

    _parseRes(answer);

    return answer;
}

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
    getProcessState: getProcessState,
    getAccountByCredentials: getAccountByCredentials,
    getRandomInt: getRandomInt,
    isArray: isArray,
    shuffleArray: shuffleArray,
    validateDbId: validateDbId,
    processPart: processPart,
    processVkResponse: processVkResponse
};