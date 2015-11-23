import utils from '../utils'
import Socket from '../socket/socket.js';

class Page {

    constructor(pageId) {
        this.pageId = pageId;
        this.accountId = null;
        this.socket = new Socket(this)
    }

    init() {
        this.socket.listen();
        this.bind();
    }

    bind() {
        var that = this;

        $('.avatarHolder').on('click', function () {
            var selector = $('#modalAccounts');
            selector.modal();
        });

        $('#modalAccounts').bind('selectAccount', function () {
            var $this = $(this);
            var $grid = $this.find('[data-toggle=bootgrid]');
            if ($grid.length) {
                var grid = $grid.data('.rs.jquery.bootgrid');
                if (grid) {
                    var selectedItemId = grid.selectedRows.length ? grid.selectedRows[0] : null;
                    var selectedItem = null;
                    if (selectedItemId) {
                        selectedItem = grid.currentRows.find(function (item) {
                            return item._id == selectedItemId
                        });
                        if (selectedItem) {
                            that.accountId = selectedItem.id;
                            var url = 'url(' + selectedItem.photo_50 + ')';
                            var selector = $('.accountHolder');
                            var avatarHolder = selector.find('.avatarHolder');
                            if (avatarHolder.css('backgroundImage') !== url) {
                                avatarHolder.css('backgroundImage', url);
                            }
                            var accountInfo = $('.accountInfo', selector);
                            $('.fio', accountInfo).text(selectedItem.last_name + ' ' + selectedItem.first_name);
                            $('.id', accountInfo).text(that.accountId);
                            $('a', accountInfo).attr('href', '/config?account='+ that.accountId);
                            var nextAccount = $('.nextAccount', selector);
                            $('a', nextAccount).attr('href', '/?account=' + that.accountId + '&next=true');
                        }
                    }
                }
            }
        });

        $('button.start').on('click', function () {
            this.socket.setProcess('test', 'start');
        });
    }

    pageReload() {

    }

    toString() {
        // return `(${this.x},${this.y})`;
    }
}


export default Page;


