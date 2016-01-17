"use strict";

var url = require('url');

var request = require('request');
var extend = require('extend');
var async = require('async');

var HttpsProxyAgent = require('https-proxy-agent');
var SocksProxyAgent = require('socks-proxy-agent');

class Validator {

    constructor(string) {
        this.string = string;
    }

    doRequest(socks, ssl, callback) {

        var pref = 'http://';

        if (socks) {
            pref = 'socks://';
        }

        var opts = url.parse(pref + this.string);

        request({
            method: 'GET',
            uri: `${ssl ? 'https' : 'http'}://google.com/`,
           // followAllRedirects: false,
           // followRedirects: false,
          //  followRedirect: false,
            timeout: 7000,
            headers: {
              //  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          //      'Accept-Encoding': 'gzip, deflate, sdch',
           //     'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
           //     'Connection': 'keep-alive',
           //     'Cookie': 'cookiestring',
               // 'Host': 'proxylist.hidemyass.com',
          //      'Pragma': 'no-cache',
           //     'Referer': `${ssl ? 'https' : 'http'}://www.yandex.ru`,
            //    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
           //     'X-Compress': null
            },
            /*agent: (socks ? new SocksProxyAgent(opts) : new HttpsProxyAgent(extend(opts, {
                secureProxy: ssl,
                secureEndpoint: ssl
            })))*/
            proxy: pref + this.string

        }, function (error, response, body) {
            if (error) {

                switch (error.code) {
                    case 'ECONNREFUSED':
                        console.log('ECONNREFUSED');
                        break;
                    case 'ECONNRESET':
                        console.log(socks)
                        console.log('ECONNRESET');
                        break;
                    case 'ETIMEDOUT':
                        console.log(socks)
                        console.log('ETIMEDOUT');
                        break;
                }
             //   console.log(error.message);

                var result = null;

                if (ssl) {
                    result = {https: !error};
                } else if (socks) {
                    result = {socks: !error};
                } else {
                    result = {http: !error};
                }


                return callback(result);
            }

            console.log(response.statusCode);
            console.log(response.headers);


            var error = null;

            if (response.statusCode >= 400) {
                error = {
                    statusCode: response.statusCode
                }
            }

            if (error) {
                for (var k in response.headers) {
                    if (k.toLowerCase().indexOf('x-') > -1) {
                        error[k] = response.headers[k]
                    }
                }
            }

            var result = null;

            if (ssl) {
                result = {https: !error};
            } else if (socks) {
                result = {socks: !error};
            } else {
                result = {http: !error};
            }


            return callback(result);

        });

       /* req.on('socket', (socket)=> {
            console.log('on socket');
            socket.setTimeout(1500);
            socket.on('timeout', function () {
                req.abort();
            });
        })*/
    }

    validate(callback) {

        var that = this;

        async.parallel([
            function (next) { //socket
                that.doRequest(true, false, function (result) {
                    return next(null, result);
                })
            },
            function (next) { //http
                that.doRequest(false, false, function (httpResult) {
                    if (httpResult.http) {
                        that.doRequest(false, true, function (httpsResult) {
                            return next(null, extend(httpsResult, httpResult));
                        })
                    } else {
                        return next(null, httpResult);
                    }
                })
            }
        ], function (err, results) {
            if (err) {

            } else {
                console.log(results);


                return callback(extend(results[0], results[1]));
            }
        });
    }
}

module.exports.get = function (req, res) {

    var urlParts = url.parse(req.url, true);
    var query = urlParts.query;

    var proxy = query.proxy;

    var list = []

    var validator = new Validator(proxy);

    validator.validate(function (result) {
        res.status(200).send(result);
    });
};
