"use strict";

class Socket {

    constructor(page) {
        this.Page = page;
        this.manager = io;
        this.socket = null;
    }

    init() {
        if (!this.initialized) {

            var that = this;

            if (!this.socket || !this.socket.connected) {

                this.socket = this.manager.connect({
                    transports: ['polling'],
                    reconnection: false
                });

                this.socket.on('setCurrentTask', function (data) {
                    that.Page.UI.setCurrentTask(that.processResponse(data));
                });

                this.socket.on('setCurrentTasks', function (data) {
                    that.Page.UI.setCurrentTasks(that.processResponse(data));
                });

                this.socket.on('setTaskState', function (data) {
                    that.Page.UI.setTaskState(that.processResponse(data));
                });

                this.socket.on('setAccountPage', function () {
                    switch (that.Page.pageId) {
                        case 'mainPage':
                        case 'validateProxies':
                        case 'validateAccounts':
                        case 'searchPeoples':
                        case 'searchGroups':
                        case 'listCreatingFromPerson':
                        case 'listCreatingFromGroup':
                        case 'listCreatingFromAudio':
                        case 'listCreatingFromVideo':
                        case 'listCreatingFromPost':
                        case 'configurationGroup':
                        case 'configurationClean':
                        case 'configurationCopy':
                            that.socket.emit('getCurrentTask', {
                                accountId: that.Page.accountId,
                                pageId: that.Page.pageId
                            });
                            break;
                        case 'taskExecution':
                            that.socket.emit('getCurrentTasks');
                            break;
                        case 'adminPanel':
                            break;
                    }
                });

                this.socket.on('setStatistic', function (data) {
                    that.Page.UI.setStatistic(that.processResponse(data));
                });

                this.socket.on('uploadFile', function (data) {
                    that.Page.UI.setProgress(that.processResponse(data));
                });

                /* GRID */

                this.socket.on('disableRow', function (data) {
                    console.log(data);
                    that.Page.UI.disableRow(that.processResponse(data));
                });

                this.socket.on('refreshRow', function (data) {
                    that.Page.UI.refreshRow(that.processResponse(data));
                });

                this.socket.on('reloadGrid', function (data) {
                    that.Page.UI.reloadGrid(that.processResponse(data));
                });

                /* */

                this.socket.on('printEvent', function (data) {
                    that.processResponse(data);
                });

                this.socket.on('displayNotification', function (data) {
                    that.processResponse(data);
                });

                this.socket.on('createTask', function (data) {
                    that.page.ui.createTask(that.processResponse.apply(that, [data]));
                });

                this.socket.on('connect', function () {
                    console.log('connected');
                });

                this.socket.on('disconnect', function () {
                    that.Page.UI.overlay('Связь с сервером потеряна, перезагрузите страницу');
                });

                this.socket.on('error', function (data) {
                    /*that.Page.UI.displayNotification({
                        notify: data,
                        type: 2
                    })*/
                    console.log(data);
                });

                this.socket.on('reconnect', function () {
                    console.log('reconnect');
                });

                this.socket.on('clientError', function (error) {
                    that.processResponse.apply(that, [error]);
                });
            }

            this.initialized = true;
        }

        return this;
    }

    shutDown() {
        this.socket.disconnect();
    }

    processResponse(data) {
        console.log(data);
        if (data) {
            if (data.hasOwnProperty('msg')) {
                this.Page.UI.printEvent(data.msg);
            }
            if (data.hasOwnProperty('badFields')) {
                this.Page.UI.highLightFields(data.badFields);
            }
            if (data.hasOwnProperty('notify')) {
                this.Page.UI.displayNotification(data);
            }
        }
        return data;
    }
}

export default Socket;


