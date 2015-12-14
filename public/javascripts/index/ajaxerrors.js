$(document).ready(function () {

    $(document).ajaxError(function (e, x, settings, exception) {
        var message;
        var statusErrorMap = {
            '400': "Server understood the request, but request content was invalid",
            '401': "Unauthorized access",
            '403': "Forbidden resource can't be accessed",
            '404': "Not found",
            '500': "Internal server error",
            '503': "Service unavailable"
        };
        if (x.status) {
            if (x.status === 500) {
                message = 'Ошибка сервера';
            } else if (x.responseJSON) {
                if (x.responseJSON.errorText || x.responseJSON.msg) {
                    message = x.responseJSON.errorText || x.responseJSON.msg;
                } else {
                    message = 'ХЗ сообщение';
                }
                if (x.responseJSON.captcha) {
                    $('#captchaFormGroup').toggleClass('hidden');
                    $('#captcha').val('');
                }
                if (x.responseJSON.fields) {
                    x.responseJSON.fields.forEach(function (item) {
                        $item = $('#' + item);
                        if (!$item.closest('.form-group').hasClass('has-error')) $item.closest('.form-group').addClass('has-error');
                    });
                }
            } else {
                message = statusErrorMap[x.status];
                if (!message) {
                    message = "Unknown Error";
                }
            }
        } else if (exception == 'parsererror') {
            message = "Parsing JSON Request failed";
        } else if (exception == 'timeout') {
            message = "Request Time out";
        } else if (exception == 'abort') {
            message = "Request was aborted by the server";
        } else {
            message = "Unknown Error";
        }
        $.notify({message: message}, {type: 'warning'});
    });

});