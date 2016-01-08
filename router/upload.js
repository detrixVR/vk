
var MemoryStream = require('memorystream');
var uploadFile = require('../socket/processes/vkUtils/uploadFile');

var memStream = new MemoryStream(null, {
    readable : true,
 //   bufoveflow: 1
});



module.exports.post = function (req, res) {
  // console.log(arg);

    console.log(req.file);// is the `avatar` file


    options = {
        token: 'c8d7eee470f0fe3714263ab5083f462959c40399f17ebcaed9a0e1d5d41a04f755aa458243721a9ef0feb',
        proxy: null,
        type: 0,
        album_id: 226515222,
        memStream: memStream,
        buffer: req.files[0].buffer,
    };

    uploadFile(options, function(err){
        res.end('ok');
    });

   // req.body will hold the text fields, if there were any
/*

var buffer = [];
    req.on('data', function(chunk) {
        console.log('data');

        var length = 0;


        for (var i = 0; i < memStream.queue.length; i++) {
            length+=memStream.queue[i].length;
        }
        console.log(chunk.length);

        length+= chunk.length;

        console.log(length);

        memStream.write(chunk);
        buffer = buffer.concat(chunk);

    }).on('end', function() {
      //  memStream.end();

        options = {
            token: 'c8d7eee470f0fe3714263ab5083f462959c40399f17ebcaed9a0e1d5d41a04f755aa458243721a9ef0feb',
            proxy: null,
            type: 0,
            album_id: 226515222,
            memStream: memStream,
            buffer: buffer,
        };

        uploadFile(options, function(err){
            res.end('ok');
        });


    });

  //  req.pipe(memStream);


 //   var length = 0;


    memStream.on('data', function(chunk) {
        // ничего не делаем с приходящими данными, просто считываем
        /!*length += chunk.length;

        console.log(length);

        if (length > 1 * 1024 * 1024) {
            res.statusCode = 413;
            res.end("File too big");
        }*!/
        console.log('memStream data');
    });

    memStream.on('pipe', function(error){
        console.log('pipe');
    });

    memStream.on('error', function(error){
        console.log('error');
    });

    /!*req.on('end', function() {
       // console.log(memStream.toString());
    });*!/

       //var length = 0;

*/


};

module.exports.get = function (req, res) {
    res.render('upload', {
        user: req.user,
        page: 'upload'
    })
};