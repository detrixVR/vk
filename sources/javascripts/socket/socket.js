import utils from '../utils'

class Socket {
    constructor(pageId) {
        this.pageId = pageId;
        this.manager = io;
        this.socket = null;
        this.state = 0;
    }

    setProcess(processId, event) {

        if (this.socket && this.socket.connected) {

            var process = {
                pageId: this.pageId,
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
                console.log(state);
                utils.setState(state);
            });
            this.socket.on('disconnect',function(){
                console.log('disconnect');
            });
        }
    }

    shutDown () {
        this.socket.disconnect();
    }

    setState(state) {
        console.log(state);
        var state = getState(this.pageId);
        this.socket.emit('setState', state);
    }

    toString() {
        // return `(${this.x},${this.y})`;
    }
}



export default Socket;


