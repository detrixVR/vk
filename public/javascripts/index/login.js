$(document).on('ready',function(){
    $(document).on('submit', '#loginForm', function (e) {
        e.preventDefault();

        var username = $('#username');
        var usernameVal = username.val();
        var password = $('#password');
        var passwordVal  = password.val();
        var remember = $('#remember').prop('checked');

        var valid = true;
        var message = '';

        if (usernameVal.length < 5 || usernameVal.length > 15) {
            username.closest('.form-group').toggleClass('has-error', true);
            message += 'Имя пользователя - от 5 до 15 символов';
            valid = false;
        }

        if (passwordVal.length < 5 || passwordVal.length > 15) {
            password.closest('.form-group').toggleClass('has-error', true);
            message += (message.length ? '<br>' : '') + 'Длина пароля - от 5 до 15 символов';
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
                username: usernameVal,
                password: passwordVal,
                remember: remember
            },
            url: './login'
        }).success(function () {
            window.location.href = "/";
        });
    });
});




