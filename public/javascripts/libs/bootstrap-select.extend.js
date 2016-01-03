(function ($) {


    var extensionMethods = {


        setWidth: function () {
            if (this.options.width === 'auto') {
                this.$menu.css('min-width', '0');

                // Get correct width if element is hidden
                var $selectClone = this.$menu.parent().clone().appendTo('body'),
                    $selectClone2 = this.options.container ? this.$newElement.clone().appendTo('body') : $selectClone,
                    ulWidth = $selectClone.children('.dropdown-menu').outerWidth(),
                    btnWidth = $selectClone2.css('width', 'auto').children('button').outerWidth();

                $selectClone.remove();
                $selectClone2.remove();

                // Set width to whatever's larger, button title or longest option
                this.$newElement.css('width', Math.max(ulWidth, btnWidth) + 'px');
            } else if (this.options.width === 'fit') {
                // Remove inline min-width so width can be changed from 'auto'
                this.$menu.css('min-width', '');
                this.$newElement.css('width', '').addClass('fit-width');
            } else if (this.options.width) {
                // Remove inline min-width so width can be changed from 'auto'
                this.$newElement.css('width', this.options.width);
                this.$menu.css({
                    'min-width': this.$newElement.outerWidth()
                    , width: this.$newElement.outerWidth()
                });

            } else {
                // Remove inline min-width/width so width can be changed
                this.$menu.css('min-width', '');
                this.$newElement.css('width', '');
            }
            // Remove fit-width class if width is changed programmatically
            if (this.$newElement.hasClass('fit-width') && this.options.width !== 'fit') {
                this.$newElement.removeClass('fit-width');
            }
        },

    };

    $.extend($.fn.selectpicker.Constructor.prototype, extensionMethods)


})(jQuery);