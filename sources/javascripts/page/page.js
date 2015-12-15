import Socket from '../socket/socket.js';
import ui from '../ui'


class Page {

    constructor(accountId, processId) {
        this.accountId      = accountId;
        this.processId      = processId;
        this.socket         = new Socket(this);
        this.ui             = ui;
    }

    init() {
        this.socket.listen();
        this.ui.init.call(this);


        switch (this.processId){
            case 'validateProxy':
                console.log('validateProxy');
                this.socket.socket.emit('join', 'validateProxy');
                break;
            case 'tasksListen':
                console.log('tasksListen');
                this.socket.socket.emit('getAllProcesses');
                this.socket.socket.emit('join', 'tasksListen');
                break;
        }
    }

    pageReload() {
        console.log('pageReload');
        console.log(this.accountId);

        this.ui.overlay('Инициализация');

        this.socket.socket.emit('getCurrentProcess', {
            accountId: this.accountId,
            processId: this.processId
        });

    }
}


export default Page;


