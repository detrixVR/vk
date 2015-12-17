import Socket from '../socket/socket.js';
import ui from '../ui'


class Page {

    constructor() {
        this.accountInfo = null;
        this.accountId = null;
        this.processId = null;
        this.socket = new Socket(this);
        this.ui = ui;
    }

    init() {
        this.socket.listen();
        this.ui.init.call(this);
    }

    pageReload(accountId) {

        this.ui.overlay('Инициализация');

        this.getAccountInfo(accountId, (account) => {

            console.log('pageReload');
            console.log(account);

            this.accountInfo = account.accountInfo;
            this.accountId = account.accountInfo.accountId;
            this.processId = account.processId;

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


