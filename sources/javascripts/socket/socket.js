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

            this.socket.on('setTaskState', function (state) {
                console.log(state);
                that.page.ui.setTaskState(processResponse.apply(that, [state]));
            });

            this.socket.on('setTask', function (process) {
                console.log(process);
                that.page.ui.setProcess(process);
            });

            this.socket.on('setProcesses', function (processes) {
                console.log(processes);
                that.page.ui.setProcess(null);
                that.page.ui.setProcesses(processes);
            });

            this.socket.on('switchAccount', function () {
                console.log('switchAccount');

                that.socket.emit('join', {
                    pageId: that.page.pageId
                });
                switch (that.page.pageId) {
                    case 'validateProxies':
                    case 'validateAccounts':
                    case 'searchPeoples':
                    case 'searchGroups':

                    case 'listCreatingFromPerson':
                    case 'listCreatingFromGroup':
                    case 'listCreatingFromAudio':
                    case 'listCreatingFromVideo':
                    case 'listCreatingFromPost':

                    //case 'listCreatingFromPost':



                    case 'configurationClean':
                    case 'configurationCopy':
                        that.socket.emit('getCurrentTask', {
                            pageId: that.page.pageId
                        });
                        break;
                    case 'taskExecution':
                        that.page.ui.setProcess(null);
                        that.socket.emit('getAllTasks');
                        break;
                    case 'defaultProcess':
                        that.socket.emit('getAllProcesses');
                        break;
                    case 'adminPanel':
                        that.page.ui.setProcess(null);
                        that.socket.emit('join', {
                            pageId: 'memoryUsage'
                        });
                        break;

                }
            });

            this.socket.on('memoryUsage', function (data) {
                console.log(data);

                that.page.ui.drawMemoryUsage(data);
              //  processResponse.apply(that, [data]);
            });

            this.socket.on('updatechat', function (data) {
                console.log(data);
                processResponse.apply(that, [data]);
            });

            this.socket.on('uploadFile', function (data) {
                console.log(data);
                that.page.ui.setProgress(data);
            });


            this.socket.on('disableRow', function (data) {
                that.page.ui.disableRow(processResponse.apply(that, [data]));
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

            this.socket.on('reloadGrid', function (data) {
                that.page.ui.reloadGrid(processResponse.apply(that, [data]));
            });

            this.socket.on('createTask', function (data) {
                that.page.ui.createTask(processResponse.apply(that, [data]));
            });

            this.socket.on('getAllTasks', function (data) {

                that.page.ui.printTasks(data);
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


