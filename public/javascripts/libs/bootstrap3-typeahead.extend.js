(function ($) {


    var extensionMethods = {


        lookup: function (rows, callback) {
            console.log('extended');

            var localRequest = function (query, process) {

                switch (this.options.type) {
                    case 'city':

                            $.post('/vkapi', {
                                command: 'database.getCities',
                                options: JSON.stringify({
                                    country_id: this.country || 1,
                                    q: query
                                })
                            }).done(function (data) {
                                if (data && data.result && data.result.response) {
                                    process($.map(data.result.response.items, function (e) {
                                        return e.title;
                                    }));
                                }
                            });


                        break;
                    case 'city':
                        break;
                }


            };

            var items;
            if (typeof(query) != 'undefined' && query !== null) {
                this.query = query;
            } else {
                this.query = this.$element.val() || '';
            }

            if (this.query.length < this.options.minLength) {
                return this.shown ? this.hide() : this;
            }

            var worker = $.proxy(function () {
                // localRequest.call(this);
                localRequest.apply(this, [this.query, $.proxy(this.process, this)]);
            }, this);

            clearTimeout(this.lookupWorker);
            this.lookupWorker = setTimeout(worker, this.delay);
        },

        process: function (items) {
            var that = this;

            /*items = $.grep(items, function (item) {
                return that.matcher(item);
            });*/

            items = this.sorter(items);

            if (!items.length && !this.options.addItem) {
                return this.shown ? this.hide() : this;
            }

            if (items.length > 0) {
                this.$element.data('active', items[0]);
            } else {
                this.$element.data('active', null);
            }

            // Add item
            if (this.options.addItem){
                items.push(this.options.addItem);
            }

            if (this.options.items == 'all') {
                return this.render(items).show();
            } else {
                return this.render(items.slice(0, this.options.items)).show();
            }
        }


    };

    $.extend($.fn.typeahead.Constructor.prototype, extensionMethods)


})(jQuery);