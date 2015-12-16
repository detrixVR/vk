import Socket from '../socket/socket.js';
import ui from '../ui'


class Page {

    constructor(accountId, processId) {
        this.accountId = accountId;
        this.processId = processId;
        this.socket = new Socket(this);
        this.ui = ui;
    }

    init() {
        this.socket.listen();
        this.ui.init.call(this);
    }

    pageReload() {
        console.log('pageReload');
        console.log(this.accountId);

        this.ui.overlay('Инициализация');

        this.socket.socket.emit('switchAccount', {
            accountId: this.accountId
        });
    }
}


export default Page;


