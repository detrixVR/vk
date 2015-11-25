import utils from '../utils'
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
        this.pageReload();
    }

    pageReload() {
        console.log('pageReload');
        console.log(this.pageId);
        console.log(this.accountId);

        this.socket.socket.emit('getCurrentProcess', {
            pageId: this.pageId,
            accountId: this.accountId
        });
    }

    toString() {
        // return `(${this.x},${this.y})`;
    }
}


export default Page;


