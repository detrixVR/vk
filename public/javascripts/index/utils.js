$(document).on('ready',function(){

    $('form input, textarea').on('keydown', function (e) {
        $(this).closest('.form-group').removeClass('has-error');
        if (!((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 65 && e.keyCode <= 90) || (e.keyCode >= 97 && e.keyCode <= 122) || e.keyCode != 8 || e.keyCode != 9)) {
            e.preventDefault();
            return 0;
        }
    });


    $('form input, textarea').on('focus', function (e) {
        $(this).select();
    });


    $.notifyDefaults({
        placement: {
            from: 'bottom',
            to: 'top'
        }
    });
});