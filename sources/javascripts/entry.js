



    import Socket from './socket/socket.js';
    import utils from './utils'


    var socket = new Socket('001');

    window.socket = socket;


    socket.listen();

    $('button').on('click',function(){
        socket.setProcess('test', 'start');
    })




