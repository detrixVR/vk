import Socket from '../socket/socket.js';
import ui from '../ui'


class Page {

    constructor(pageId, accountId) {
        this.pageId         = pageId;
        this.accountId      = accountId;
        this.socket         = new Socket(this);
        this.ui             = ui;
    }

    init() {
        this.socket.listen();
        this.ui.init.call(this);
    }

    pageReload() {
        console.log('pageReload');
        console.log(this.pageId);
        console.log(this.accountId);

        this.ui.overlay('Инициализация');

        this.socket.socket.emit('getCurrentProcess', {
            pageId: this.pageId,
            accountId: this.accountId
        });
    }
}


export default Page;


