import utils from '../utils'

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

    getState() {
        return this.state
    }

    listen() {
        var that = this;

        if (!this.socket || !this.socket.connected) {

            this.socket = this.manager.connect({
                 reconnect: true
            });

            this.socket.on('connect', function () {
                console.log('connect');
            });

            this.socket.on('time', function (data) {
                console.log(data);
            });

            this.socket.on('setState', function (state) {
                that.page.ui.setState(state);
            });

            this.socket.on('setProcess', function(process){
                console.log(process);

                    that.page.ui.setProcess(process);

            });

            this.socket.on('gridRowEvent', function (data) {
                $('[data-toggle=bootgrid]').trigger('gridRowEvent', data);
            });

            this.socket.on('disconnect',function(){
                console.log('disconnect');
            });
        }
    }

    shutDown () {
        this.socket.disconnect();
    }



    toString() {
        // return `(${this.x},${this.y})`;
    }
}



export default Socket;


