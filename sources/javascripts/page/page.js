import Socket from '../socket/socket.js';
import Menu from '../menu/menu.js';
import ui from '../ui'
import {_} from 'underscore';

_.templateSettings = {
    evaluate:    /\{\{(.+?)\}\}/g,
    interpolate: /\{\{=(.+?)\}\}/g,
    escape: /\{\{-(.+?)\}\}/g
};


class Page {

    constructor() {
        this.accountInfo = null;
        this.accountId = null;
        this.pageId = null;
        this.socket = new Socket(this);

        this.leftMenu = new Menu(this, 'left');
        this.rightMenu = new Menu(this, 'right');

        this.ui = ui;
    }

    init() {
        this.socket.listen();
        this.ui.init.call(this);

       // this.test();
    }

    pageReload(accountId) {

        this.ui.overlay('Инициализация');

        this.getAccountInfo(accountId, (account) => {

            console.log('pageReload');
            console.log(account);

            this.accountInfo = account.accountInfo;
            this.accountId = account.accountInfo.accountId;
            this.pageId = account.pageId;

            this.ui.renderAccountHolder(account);

            this.socket.socket.emit('switchAccount', {
                accountId: this.accountId
            });
        })
    }

    getAccountInfo(accountId, callback) {
        if (accountId) {
            location.search = 'account=' + accountId;
        } else {
            $.post('/account', {
                location: JSON.stringify(window.location)
            }).done(function (account) {
                callback(account);
            });
        }
    }
}


export default Page;


