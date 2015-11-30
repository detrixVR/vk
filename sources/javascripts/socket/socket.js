import ui from '../ui'

function processResponse(item) {
    if (item.hasOwnProperty('msg')) {
        this.page.ui.printEvent(item.msg);
    }
    return item;
}

class Socket {

    constructor(page) {
        this.page = page;
        this.manager = io;
        this.socket = null;
        this.state = 0;
    }

    setProcess(processId, event) {
        if (this.socket && this.socket.connected) {
            var process = {
                pageId: this.page.pageId,
                processId: processId,
                event: event,
                settings: utils.getSettings()
            };
            this.socket.emit('setProcess', process);
        }
    }


    listen() {
        var that = this;

        if (!this.socket || !this.socket.connected) {

            this.socket = this.manager.connect({
                reconnect: true
            });

            this.socket.on('connect', function () {
                console.log('connect');
                that.page.pageReload();
            });


            this.socket.on('setState', function (state) {
                that.page.ui.setState(processResponse.apply(that, [state]));
            });

            this.socket.on('setProcess', function (process) {
                that.page.ui.setProcess(process);
            });

            this.socket.on('printEvent', function (data) {
                processResponse.apply(that, [data]);
            });

            this.socket.on('refreshRow', function (data) {
                $('[data-toggle=bootgrid]').trigger('refreshRow', processResponse.apply(that, [data]));
            });

            this.socket.on('disconnect', function () {
                ui.overlay('Связь с сервером потеряна');
            });


            this.socket.on('reconnect',function(){
                console.log('reconnect');
            })
        }
    }

    shutDown() {
        this.socket.disconnect();
    }
}


export default Socket;


