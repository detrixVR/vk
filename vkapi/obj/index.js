"use strict";

var extend = require('extend');
var request = require('request');
var HttpsProxyAgent = require('https-proxy-agent');
var SocksProxyAgent = require('socks-proxy-agent');
var url = require('url');

class VK {

    constructor(options) {

        this.options = {
            'appSecret': false,
            'appId': false,
            'https': false,
            'version': '5.42',
            'language': 'ru',
            'secure': true,
            'timeout': 1500
        };

        this.token = false;

        this.proxy = false;

        this.agent = null;

        this.options = extend(this.options, options);
    }

    implode(glue, pieces) {
        return ( ( pieces instanceof Array ) ? pieces.join(glue) : pieces );
    }

    buildQuery(params) {
        var arr = [];
        for (var name in params) {
            var value = params[name];

            if ("undefined" !== typeof value) {
                arr.push(name + '=' + encodeURIComponent(value));
            }
        }

        return this.implode('&', arr);
    }

    setToken(token) {
        this.token = token;
        return true;
    }

    setProxy(proxy) {

        this.proxy = proxy;

        var opts = url.parse(this.proxy);

        this.agent = new HttpsProxyAgent(opts);

        return true;
    }

    request(method, requestParams, callback) {

        var params = {
            'lang': this.options.lang,
            'v': this.options.version,
            'https': (this.options.https) ? 1 : 0
        };


        for (var i in requestParams) {
            params[i] = requestParams[i];
        }

        var requestString = this.buildQuery(params);

        if (this.options.secure) {
            if (this.token) {
                requestString = requestString + '&access_token=' + this.token;
            }
        }

        var options = {
            host: 'api.vk.com',
            port: 443,
            path: '/method/' + method,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': requestString.length,
                'User-Agent': this.options.userAgent || 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'
            },
            agent: this.agent
        };

        async.forever(function (next) {

            var post_req = https.request(options, function (res) {

                    var apiResponse = "";

                    res.setEncoding('utf8');

                    res.on('data', function (chunk) {
                        apiResponse += chunk;
                    });

                    res.on('end', function () {

                        try {
                            var o = JSON.parse(apiResponse);
                        } catch (e) {
                            return next(e);
                        }

                        return next({success: o});

                    });

                })
                .on('socket', (socket) => {

                    socket.setTimeout(this.options.timeout, ()=> {
                        post_req.abort();
                    });

                    /*socket.on('timeout', function () {

                     });*/
                })
                .on('error', (e) => {

                    switch (e.code) {
                        case 'ETIMEDOUT':
                            console.error('ETIMEDOUT');
                            return next();
                        case 'ECONNRESET':
                            console.error('ECONNRESET');
                            return next();
                    }

                    return next(e);
                });

            post_req.write(requestString);
            post_req.end();

        }, function (err) {

            if (err.hasOwnProperty('success')) {
                return callback(null, err.success)
            }

            return (err);

        });
    }
}

module.exports = VK;

