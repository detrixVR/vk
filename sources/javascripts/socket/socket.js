class Socket {
    constructor(pageId) {
        this.pageId = pageId;
        this.socket = io();
    }

    listen() {
        this.socket.on('time', function (data) {
            console.log(data);
        })
    }

    toString() {
        // return `(${this.x},${this.y})`;
    }
}



export default Socket;


