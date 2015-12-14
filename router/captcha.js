var captchaPNG = require('captchapng');

module.exports.get = function (req, res) {

    var captcha = parseInt(Math.random() * 9000 + 1000);
    var p = new captchaPNG(200, 60, captcha); // width,height,numeric captcha
    p.color(255, 255, 255, 255);  // First color: background (red, green, blue, alpha)
    p.color(0, 0, 0, 255); // Second color: paint (red, green, blue, alpha)

    var img = p.getBase64();
    var imgbase64 = new Buffer(img, 'base64');

    req.session.captcha = captcha;

    console.log("d: ", captcha);

    res.writeHead(200, {
        'Content-Length': imgbase64.length,
        'Content-Type': 'image/png'
    });

    res.write(imgbase64, 'base64');
    res.end();
};

