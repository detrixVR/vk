import ui from '../ui'

function processResponse(item) {
    if (item.hasOwnProperty('msg')) {
        this.page.ui.printEvent(item.msg);
    }
    if (item.hasOwnProperty('badFields')) {
        this.page.ui.highLightFields(item.badFields);
    }
    if (item.hasOwnProperty('notify')) {
        this.page.ui.displayNotification(item);
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
                transports: ['websocket'],
                reconnection: false
            });

            this.socket.on('connect', function () {
                console.log('connect');
                that.page.pageReload();
            });

            this.socket.on('setState', function (state) {
                console.log(state);
                that.page.ui.setState(processResponse.apply(that, [state]));
            });

            this.socket.on('setProcess', function (process) {
                console.log(process);
                that.page.ui.setProcess(process);
            });

            this.socket.on('setProcesses', function (processes) {
                console.log(processes);
                that.page.ui.setProcess(null);
                that.page.ui.setProcesses(processes);
            });

            this.socket.on('switchAccount', function () {
                that.socket.emit('join', {
                    processId: that.page.processId
                });
                switch (that.page.processId) {
                    case 'validateProxies':
                        that.socket.emit('getCurrentProcess', {
                            processId: that.page.processId
                        });
                        break;
                    case 'defaultProcess':
                        that.socket.emit('getAllProcesses');
                        break;
                }

            });


            this.socket.on('updatechat', function (data) {
                console.log(data);
                processResponse.apply(that, [data]);
            });

            this.socket.on('printEvent', function (data) {
                processResponse.apply(that, [data]);
            });

            this.socket.on('displayNotification', function (data) {
                processResponse.apply(that, [data]);
            });

            this.socket.on('refreshRow', function (data) {
                that.page.ui.refreshRow(processResponse.apply(that, [data]));
            });

            this.socket.on('disconnect', function () {
                ui.overlay('Связь с сервером потеряна, перезагрузите страницу');
            });

            this.socket.on('error', function (data) {
                ui.displayNotification({
                    notify: data,
                    type: 2
                })
            });

            this.socket.on('reconnect', function () {
                console.log('reconnect');
            });

            this.socket.on('clientError', function (error) {
                processResponse.apply(that, [error]);
            });
        }
    }

    shutDown() {
        this.socket.disconnect();
    }
}


export default Socket;


