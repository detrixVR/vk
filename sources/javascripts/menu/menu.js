class Menu {

    constructor(page, side) {
        this.Page = page;

        switch (side) {
            case 'right':
                this.$elem = $('.right-menu');
                break;
            case 'left':
                this.$elem = $('.left-menu');
                break;
        }

        this.$toolbar = $('.menu-toolbar', this.$elem);
        this.$body = $('.menu-body', this.$elem);
        this.$footer = $('.menu-footer', this.$elem);

        this.type = 'list';
        this.content = 'account';
        this.visible = false;
        this.timeout = null;
        this.selectedId = null;
    }

    _hideMenu() {
        this.visible = false;
        this.$elem.off('focusout').off('focusin');
        this.$elem.data('visible', false).attr('data-visible', false);
    }

    toggleMenu() {
        var that = this;
        this.visible = !this.visible;
        clearTimeout(this.timeout);
        if (this.visible && !this.progress) {

            this.$elem.on('focusout', function (e) {
                that.timeout = setTimeout(function () {
                    that._hideMenu();
                }, 1);
            });
            this.$elem.on('focusin', function (e) {
                clearTimeout(that.timeout);
            });
            this.$elem.find('input').focus();
            let $list = this.$elem.find('.list');
            if (!$list.data('jsp'))
                this.$elem.find('.list').jScrollPane();
            let $pane = this.$elem.find('.jspPane');
            this.$elem.data('visible', true).attr('data-visible', true);
            this.$toolbar.find('input').val('');
            this.progress = true;
            this.Page.UI.progress(this.$body, this.progress);
            this.Page.requester.accounts.get(null, function (err, data) {
                $pane.html(_.template($('#accountListRowTemplate').html())({data: data}));
                that.progress = false;
                that.Page.UI.progress(that.$body, that.progress);
                $list.data('jsp').reinitialise();
            })
        } else {
            this._hideMenu();
        }
    }


    menuSearch($elem) {
        let $input = $elem.closest('.input-holder').find('input');
        let $list = $elem.closest('.menu-content').find('.list');
        if ($input.length) {
            let searchText = $input.val();
            let listItems = $('.list-elem', $list);
            listItems.each(function (i, item) {
                let $item = $(item);
                let textContent = $item.text().toLowerCase();
                $item.toggleClass('hidden', !~textContent.indexOf(searchText.toLowerCase()));
            });
            $list.data('jsp').reinitialise();
        }
    }

    menuSelectListItem($elem) {
        let $list = $elem.closest('.list');
        $('.list-elem', $list).toggleClass('selected', false);
        $elem.toggleClass('selected', true);
        this.selectedId = $elem.data('id');
    }

    menuGetListItem($elem) {
        var that = this;
        if (this.selectedId) {
            this.Page.requester.accounts.get({id: this.selectedId}, function (err, data) {
                if (data && data.length) {
                    switch (that.content){
                        case 'account':
                            that.Page.switchAccount(data[0]);
                            break;
                    }
                }
                console.log(data);
            });
            this._hideMenu();
        }
    }

    menuToggleFilter($elem){

    }
}

export default Menu;