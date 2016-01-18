"use strict";

var url = require('url');

//var request = require('request');
var extend = require('extend');
var async = require('async');

var http = require('http');
var https = require('https');

var HttpsProxyAgent = require('https-proxy-agent');
var SocksProxyAgent = require('socks-proxy-agent');

var shttps = require('socks5-https-client');

var Agent = require('socks5-https-client/lib/Agent');
//var Curl = require( 'node-libcurl' ).Curl;


var shttp = require('socks5-http-client');

var socksv5 = require('socksv5');

class Validator {

    constructor(string) {
        this.string = string;
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

    doRequest(socks1, callback) {

        var pref = 'http://';

        if (socks1) {
            pref = 'socks://';
        }

        var options = {
            host: 'api.vk.com',
            port: 443,
            method: 'GET',
        };

        console.log()

        var request = null;
        var requester = socks1 ? shttps : https;

        if (socks1) {
            options.socksHost = url.parse(pref + this.string).hostname;
            options.socksPort = url.parse(pref + this.string).port;
        } else {
            options.agent = new HttpsProxyAgent(pref + this.string);
        }

        request = requester.request(options, function (res) {

            console.log(res.statusCode);

           // this.abort();

            var result = null;

            if (socks1) {
                result = {socks: res.statusCode === 403};
            } else {
                result = {http: res.statusCode === 403};
            }

            return callback(result);

        });

       // var callback = callback;
       // console.log(request);

        request.callback = callback(request);
        request.on('error', function (e) {

            console.log(socks1);

            console.log(`Got error: ${e.message}`);

            var result = null;

            if (socks1) {
                result = {socks: !e};
            } else {
                result = {http: !e};
            }

            console.log(socks1);

            return this.callback(result);

        }).on('socket', function (socket) {

            console.log('socket');

            var that = this;
            socket.setTimeout(15000, function (e) {

                that.abort();

                if (socks1)
                    that.emit('error', new Error('TLS handshake timeout1'));
            });


        }).end();


    }

    validate(callback) {

        var that = this;

        async.parallel([
            function (next) { //socket

                that.doRequest(true, function (result) {
                    console.log('here1')
                    return next(null, result);
                })
                // return next(null, null);

            },
            function (next) { //http

                that.doRequest(false, function (result) {
                    console.log('here2')
                    return next(null, result);
                })
                // return next(null, result);
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
