var url = require('url');

var request = require('request');

module.exports.get = function (req, res) {

    var urlParts = url.parse(req.url, true);
    var query = urlParts.query;

    var proxy = query.proxy;

    var j = request.jar();

   // j.setCookies()

    request({
        method: 'GET',
        uri: 'http://yandex.ru/',
        headers: {
            cookie: 'cookiestring'
        },
     //   proxy: 'http://'+proxy

    }, function (error, response, body) {
        if (error) {
            return console.error('upload failed:', error);
        }
        console.log('Upload successful!  Server responded with:', body);

        console.log(response);
        res.status(200).send(proxy);
    });

    console.log(query);


};
