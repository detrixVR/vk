(function ($) {


    var extensionMethods = {

        setAccountId: function(accountId){
            this.accountId = accountId;
        },

        append: function (rows, callback) {
            var that = this;
            if (this.options.ajax) {
                $.ajax({
                    method: 'PUT',
                    data: {
                        options: JSON.stringify({
                            listType: that.listType,
                            listName: that.listName,
                            accountId: that.accountId,
                            rows: rows
                        })
                    },
                    url: '/list'
                }).done(function () {
                    return callback();
                }).fail(function (fail) {
                    return callback(fail);
                });
            } else {
                console.error('not ajax');
            }
            return this;
        },
        remove: function (rowIds, callback) {
            if (this.identifier != null) {
                var that = this;
                if (this.options.ajax) {
                    $.ajax({
                        method: 'DELETE',
                        data: {
                            options: JSON.stringify({
                                listType: that.listType,
                                listName: that.listName,
                                accountId: that.accountId,
                                ids: rowIds
                            })
                        },
                        url: '/list'
                    }).done(function () {
                        callback();
                    }).fail(function (fail) {
                        callback(fail);
                    });
                } else {
                    console.error('not ajax');
                }
            }
            return this;
        }
    };

    $.extend($.fn.bootgrid.Constructor.prototype, extensionMethods)


})(jQuery);