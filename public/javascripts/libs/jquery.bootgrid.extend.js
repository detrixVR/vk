(function ($) {

    function getRequest() {
        var request = {
                current: this.current,
                rowCount: this.rowCount,
                sort: this.sortDictionary,
                searchPhrase: this.searchPhrase,
                listType: this.listType
            },
            post = this.options.post;

        post = ($.isFunction(post)) ? post() : post;
        return this.options.requestHandler($.extend(true, request, post));
    }

    var extensionMethods = {




        append: function (rows, callback) {
            var that = this;
            if (this.options.ajax) {
                $.ajax({
                    method: 'PUT',
                    data: {
                        options: JSON.stringify({
                            listType: that.listType,
                            rows: rows
                        })
                    },
                    url: '/grid'
                }).done(function () {
                    return callback();
                }).fail(function (fail) {
                    return callback(fail);
                })
            } else {
                var appendedRows = [];
                for (var i = 0; i < rows.length; i++) {
                    if (appendRow.call(this, rows[i])) {
                        appendedRows.push(rows[i]);
                    }
                }
                sortRows.call(this);
                highlightAppendedRows.call(this, appendedRows);
                loadData.call(this);
                this.element.trigger("appended" + namespace, [appendedRows]);
            }

            return this;
        }



    };

    $.extend($.fn.bootgrid.Constructor.prototype, extensionMethods)


})(jQuery);