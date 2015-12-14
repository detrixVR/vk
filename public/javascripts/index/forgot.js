$(document).ready(function () {

    function getCaptcha() {
        var date = Date.now();
        $('#captchaHolder').css('background-image', 'url("/captcha.png?p=' + date + '")');
    }

    getCaptcha();

    $('#refreshCaptcha', '#forgotForm').on('click', function (e) {
        e.preventDefault();
        getCaptcha();
    });

    $('#captchaFormGroup').toggleClass('hidden');

    $(document).on('submit', '#forgotForm', function (e) {

        e.preventDefault();

        var forgotEmail = $('#forgotEmail');
        var forgotEmailVal = forgotEmail.val();
        var captcha = $('#captcha');
        var captchaVal = captcha.val();

        var valid = true;
        var message = '';

        function validateEmail(email) {
            var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            return re.test(email);
        }

        if (!validateEmail(forgotEmailVal)) {
            forgotEmail.closest('.form-group').toggleClass('has-error', true);
            message += 'Введите валидный адрес';
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
                forgotEmail: forgotEmailVal,
                captcha: captchaVal
            },
            url: './forgot'
        }).success(function () {
            window.location.href = "/";
        });
    });
});

