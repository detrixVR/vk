$(document).on('ready',function(){

    function getCaptcha() {
        var date = Date.now();
        $('#captchaHolder').css('background-image', 'url("/captcha.png?p=' + date + '")');
    }

    getCaptcha();

    $('#refreshCaptcha', '#signupForm').on('click', function (e) {
        e.preventDefault();
        getCaptcha();
    });

    $('#captchaFormGroup').toggleClass('hidden');

    $('#signupForm').on('submit', function (e) {

        e.preventDefault();

        var usernameOne = $('#usernameOne');
        var usernameOneVal = usernameOne.val();
        var passwordOne = $('#passwordOne');
        var passwordOneVal = passwordOne.val();
        var passwordTwo = $('#passwordTwo');
        var passwordTwoVal = passwordTwo.val();
        var captcha = $('#captcha');
        var captchaVal = captcha.val();

        var valid = true;
        var message = '';

        if (usernameOneVal.length < 5 || usernameOneVal.length > 15) {
            usernameOne.closest('.form-group').toggleClass('has-error', true);
            message += 'Имя пользователя - от 5 до 15 символов';
            valid = false;
        }

        if (passwordOneVal.length < 5 || passwordOneVal.length > 15) {
            passwordOne.closest('.form-group').toggleClass('has-error', true);
            message += (message.length ? '<br>' : '') + 'Длина пароля - от 5 до 15 символов';
            valid = false;
        }

        if (!passwordTwoVal.length) {
            passwordTwo.closest('.form-group').toggleClass('has-error', true);
            message += (message.length ? '<br>' : '') + 'Повторите пароль';
            valid = false;
        }

        if (passwordOneVal !== passwordTwoVal) {
            passwordOne.closest('.form-group').toggleClass('has-error', true);
            passwordTwo.closest('.form-group').toggleClass('has-error', true);
            message += (message.length ? '<br>' : '') + 'Пароли должны совпадать';
            valid = false;
        }

        if (!captchaVal.length) {
            captcha.closest('.form-group').toggleClass('has-error', true);
            message += (message.length ? '<br>' : '') + 'Введите код с картинки';
            valid = false;
        }


        if (!valid) {
            $.notify({message: message}, {type: 'warning'});
            return 0;
        }

        $.ajax({
            type: 'POST',
            dataType: 'json',
            data: {
                username: usernameOneVal,
                password: passwordOneVal,
                captcha: captchaVal
            },
            url: './register',
            global: false
        }).done(function () {
            window.location.href = '/';
        }).fail(function(fail){
            getCaptcha();
            $.notify({message: fail.responseJSON ? fail.responseJSON.errorText : 'Ошибка сервера'}, {type: 'warning'});
        });
    });

});






