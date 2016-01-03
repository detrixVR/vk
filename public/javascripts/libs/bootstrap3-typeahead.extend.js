(function ($) {


    var extensionMethods = {

        select: function () {
            var val = this.$menu.find('.active').data('value');
            this.$element.data('value', val);
            this.$element.data('active', val.id);
            if(this.autoSelect || val.id) {
                var newVal = this.updater(val.title);
                // Updater can be set to any random functions via "options" parameter in constructor above.
                // Add null check for cases when upadter returns void or undefined.
                if (!newVal) {
                    newVal = "";
                }
                this.$element
                    .val(this.displayText(newVal) || newVal)
                    .change();
                this.afterSelect(newVal);
            }
            return this.hide();
        },

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
                                /*process($.map(data.result.response.items, function (e) {
                                 return e.title;
                                 }));*/
                                process(data.result.response.items);
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

            //items = this.sorter(items);

            if (!items.length && !this.options.addItem) {
                return this.shown ? this.hide() : this;
            }

            if (items.length > 0) {
                this.$element.data('active', items[0]);
            } else {
                this.$element.data('active', null);
            }

            // Add item
            if (this.options.addItem) {
                items.push(this.options.addItem);
            }

            if (this.options.items == 'all') {
                return this.render(items).show();
            } else {
                return this.render(items.slice(0, this.options.items)).show();
            }
        },

        render: function (items) {
            var that = this;
            var self = this;
            var activeFound = false;

            items = $(items).map(function (i, item) {
                var text = self.displayText(item);
                i = $(that.options.item).data('value', item);
                switch (self.options.type) {
                    case 'city':
                        i.find('a').html('<div>' + item.title + '</div><div><span class="small text-muted">' + (item.region ? item.region : item.title) + '</span></div>');
                        break;
                    default:
                        i.find('a').html(that.highlighter(text));
                }
                if (text == self.$element.val()) {
                    i.addClass('active');
                    self.$element.data('value', item);
                    self.$element.data('active', item.id);
                    activeFound = true;
                }
                return i[0];
            });

            if (this.autoSelect && !activeFound) {
                items.first().addClass('active');
                this.$element.data('value', items.first().data('value'));
                this.$element.data('active', items.first().data('value').id);
            }
            this.$menu.html(items);
            return this;
        },

        show: function () {
            var pos = $.extend({}, this.$element.position(), {
                height: this.$element[0].offsetHeight
            }), scrollHeight;

            scrollHeight = typeof this.options.scrollHeight == 'function' ?
                this.options.scrollHeight.call() :
                this.options.scrollHeight;

            var element;
            if (this.shown) {
                element = this.$menu;
            } else if (this.$appendTo) {
                element = this.$menu.appendTo(this.$appendTo);
            } else {
                element = this.$menu.insertAfter(this.$element);
            }
            element.css({
                    top: pos.top + pos.height + scrollHeight
                    , left: pos.left
                    , width: this.$element.outerWidth()
                    , 'min-width': this.$element.outerWidth()
                })
                .show();

            this.shown = true;
            return this;
        },

        blur: function (e) {


           // this.select();
            this.focused = false;
            if (!this.mousedover && this.shown) this.hide();
        },

    };

    $.extend($.fn.typeahead.Constructor.prototype, extensionMethods)


})(jQuery);