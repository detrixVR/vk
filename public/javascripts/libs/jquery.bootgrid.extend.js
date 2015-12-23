(function ($) {

    var extensionMethods = {

        sort: function () {
            console.log(123);
        }
    };

    $.extend($.fn.bootgrid.Constructor.prototype, extensionMethods)


})(jQuery);