"use strict";


var cheerio = require('cheerio'),
    http = require('http'),
    https = require('https'),
    async = require('async'),
    url = require('url'),
    extend = require('extend'),
    cookie = require('cookie'),
    iconv = require('iconv-lite'),
    windows1251 = require('windows-1251'),
    zlib = require('zlib'),
    uuid = require('node-uuid'),
    dbBrowser = require('models/browser'),
    utils = require('modules/utils'),
    _ = require('underscore');


var Iconv = require('iconv').Iconv;
var fromEnc = 'UTF-8';
var toEnc = 'WINDOWS-1251';
var translator = new Iconv(fromEnc, toEnc);

class Browser {

    constructor(options) {

        let defaults = {
            username: 'huyax',
            uid: uuid.v1(),
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, sdch',
                'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36'
            },
            cookiesString: '',
            cookies: [],
            logined: false
        };

        defaults = extend(defaults, options);


        this.username = defaults.username;

        this.uid = defaults.uid;

        this.headers = defaults.headers;

        this.cookiesString = defaults.cookiesString;

        this.cookies = defaults.cookies;

        this.logined = defaults.logined;

        /*switch (options.browser) {
         case 'chrome':
         break;
         }*/

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

    clearCookies() {
        this.cookiesString = '';
        this.cookies = [];
    }

    processCookies(headers) {
        let self = this;

        if (headers['set-cookie']) {


            _.forEach(headers['set-cookie'], function (item) {
                let parsed = cookie.parse(item);
                for (var key in parsed) {
                    if (parsed[key].toLowerCase() === 'deleted') {
                        return (0);
                    } else {
                        return self.cookies.push(parsed);
                    }
                }
            });

        }

        console.log(self.cookies);

        self.cookiesString = _.reduce(this.cookies, function (sum, value) {
            for (var key in value) {
                return sum += `${cookie.serialize(key, value[key])}; `;
            }
        }, '');


        console.log(this.cookiesString);
    }

    processResponse(req, res, callback) {

        let self = this;

        console.log(res.statusCode);
        console.log(res.headers);

        self.processCookies(res.headers);

        switch (res.statusCode) {
            case 200:
                break;
            case 302:
                return self.getUrl(res.headers['location'], callback);
            default :
                req.emit('error', new Error(`Неверный код ответа: ${res.statusCode}`));
                req.abort();
        }

        if (res.headers['content-encoding'] === 'gzip') {

            let content = '';

            let charset = 'win1251';

            switch (res.headers['content-type']) {
                case 'text/html; charset=windows-1251':
                    charset = 'win1251';
                    break;
                default :
                    charset = 'win1251';
            }

            let gunzip = zlib.createGunzip();

            res.pipe(gunzip);

            gunzip.on('data', function (data) {

                content += iconv.decode(data, charset);

            }).on("end", function () {
                return callback(null, content);
            }).on("error", function (err) {
                return callback(err);
            })

        } else {

            let content = '';

            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                content += chunk;
            });

            res.on('end', function () {
                return callback(null, content);
            });
        }
    }


    getUrl(query, callback) {

        let self = this;

        console.log('getUrl: ' + arguments);

        let parsed = url.parse(query);


        delete this.headers['Content-Type'];
        delete this.headers['Content-Length'];


        this.headers['Cookie'] = this.cookiesString;


        let requestParams = {
            hostname: parsed.hostname,
            port: 80,
            path: parsed.path,
            headers: this.headers
        };

        console.log(requestParams);

        let req = http.get(requestParams, function (res) {
            self.processResponse(req, res, function (err, content) {
                return callback(err ? err : null, content);
            })
        }).on('error', function (err) {
            return callback(err);
        })
    }

    postForm(action, formData, callback) {

        let self = this;

        console.log(`action: ${action} ${formData}`);

        let parsed = url.parse(action);

        if (!parsed.hostname || !parsed.hostname || !parsed.hostname || !parsed.protocol) {
            return callback(new Error('Неверные параметры'));
        }

        let isSecured = parsed.protocol === 'https:';

        let requestString = this.buildQuery(formData);

        this.headers['Cookie'] = this.cookiesString;
        this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        this.headers['Content-Length'] = requestString.length;

        let requestParams = {
            host: parsed.hostname,
            port: isSecured ? 443 : 80,
            path: parsed.path,
            method: 'POST',
            headers: this.headers
        };

        console.log(requestParams);

        let post_req = null;

        if (isSecured) {
            post_req = https.request(requestParams, function (res) {
                self.processResponse(post_req, res, function (err, content) {
                    return callback(err ? err : null, content);
                })
            });
        } else {
            post_req = http.request(requestParams, function (res) {
                self.processResponse(post_req, res, function (err, content) {
                    return callback(err ? err : null, content);
                })
            });
        }

        post_req.write(requestString);
        post_req.end();

        post_req.on('error', function (err) {
            return callback(err);
        })
    }

    login(callback) {
        console.log('login: ' + arguments);

        let self = this;

        this.clearCookies();

        this.getUrl('http://vk.com', function (err, content) {
            if (err) {
                console.error(err);
            } else {

                let $ = cheerio.load(content);

                let formData = {};

                let $loginForm = $('form[name=login]');

                if ($loginForm) {

                    let action = $loginForm[0].attribs.action;

                    $('input', $loginForm).each(function (i, item) {
                        if (item.attribs.name) {
                            formData[item.attribs.name] = item.attribs.value || ''
                        }
                    });

                    formData['email'] = '89297064207';
                    formData['pass'] = 'jukebox5653';

                    console.log(formData);
                    console.log(action);

                    self.postForm(action, formData, function (err, content) {
                        if (err) {
                            return callback(err);
                        } else {
                            console.log('done');
                            console.log(content);

                            let result = /parent.onLoginDone\('\/(.*?)'\)/.exec(content);

                            if (result) {
                                self.getUrl('http://vk.com/' + result[1], function (err, content) {
                                    if (err) {
                                        return callback(err);
                                    } else {
                                        self.logined = true;
                                        return callback(null, content);
                                    }
                                });
                            } else {
                                return callback(new Error('Не найден таргет после логина'));
                            }
                        }
                    })

                } else {
                    return callback(new Error('Не найдена логинка'));
                }
            }
        });

        return this;

    }

    isLogined() {
        return this.logined;
    }

    getFiends(action, formData, callback) {

        let self = this;

        console.log(`action: ${action} ${formData}`);

        let parsed = url.parse(action);

        if (!parsed.hostname || !parsed.hostname || !parsed.hostname) {
            return callback(new Error('Неверные параметры'));
        }

        let requestString = this.buildQuery(formData);

        this.headers['Cookie'] = this.cookiesString;
        this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        this.headers['Content-Length'] = requestString.length;

        let requestParams = {
            host: parsed.hostname,
            port: 80,
            path: parsed.path,
            method: 'POST',
            headers: this.headers
        };

        console.log(requestParams);


        let post_req = https.request(requestParams, function (res) {
            self.processResponse(post_req, res, function (err, content) {
                return callback(err ? err : null, content);
            })
        });

        post_req.write(requestString);
        post_req.end();

        post_req.on('error', function (err) {
            return callback(err);
        })
    }

    saveToDb(callback) {

        dbBrowser.update({
            uid: this.uid
        }, {
            username: this.username,

            logined: this.logined,
            headers: this.headers,
            cookiesString: this.cookiesString,
            cookies: this.cookies,

            uid: this.uid
        }, {
            upsert: true,
            setDefaultsOnInsert: true
        }, function (err) {
            return callback(err ? err : null)
        });

    }
}


module.exports.get = function (req, res) {


    dbBrowser.findOne({
        username: 'huyax'
    }, function (err, doc) {
        if (err) {
            console.error(err);
        } else {

            let bbrowser = new Browser(doc);

            async.waterfall([function (callback) {

                if (!bbrowser.isLogined()) {
                    bbrowser.login(function (err, mainpage) {


                        if (!err) {
                            bbrowser.saveToDb(function (err) {
                                if (err) {
                                    return callback(err);
                                } else {
                                    return callback();
                                }
                            })
                        } else {
                            return callback(err);
                        }

                    })
                } else {
                    return callback();
                }
            }, function (callback) {

                /*bbrowser.postForm('http://vk.com/al_im.php', {
                 'act': 'a_get_fast_chat',
                 //   'ads_section': 'photos',
                 //  'ads_showed': '6_0231d9f5,5_6dc61907,5_db865d18',
                 'al': '1',
                 //   'al_ad': '1',
                 //    'list': 'photos275667666',
                 //    'module': 'photos',
                 //    'photo': '275667666_396273017'
                 }, function (err, content) {
                 return callback(err ? err : null, content);
                 });*/


                bbrowser.getUrl('http://vk.com/katemicha', function (err, content) {


                    return callback(err ? err : null, content);
                });

            }], function (err, content) {
                if (err) {
                    console.error(err);
                } else {
                    console.log(content);

                    let notifier = /Notifier.init\((.*?)\)/.exec(content);
                    // /parent.onLoginDone\('\/'\)/
                    console.log(notifier[1]);

                    if (notifier[1]) {

                        notifier = JSON.parse(notifier[1]);

                        let params = {
                            'act': 'a_check',
                            'ts': notifier.timestamp,
                            'key': notifier.key,
                            'id': notifier.uid,
                            'wait': 25
                        };

                        bbrowser.postForm(notifier.server_url, params, function (err, content) {
                            if (err) {
                                console.error(err);
                            } else {
                                console.log(content);
                            }
                        });

                    }


                    // console.log(utils.processVkResponse(content))

                }
            });
        }
    });


    res.status(200).send('OK');
};
