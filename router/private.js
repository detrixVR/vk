"use strict";


var cheerio = require('cheerio'),
    http = require('http'),
    https = require('https'),
    async = require('async'),
    url = require('url'),
    extend = require('extend'),
    cookie = require('cookie'),
    iconv = require('iconv-lite'),
    zlib = require('zlib'),
    uuid = require('node-uuid'),
    dbBrowser = require('models/browser'),
    utils = require('modules/utils'),
    _ = require('underscore');

class Browser {

    constructor(options) {

        if (!options.email || !options.pass || !options.username) {
            throw new Error('an Browser `email`, `pass`, `username` must be specified!');
        }

        let defaults = {
            //username: options.username,
            // email: options.email,
            //pass: options.pass ,
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
            hostName: 'vk.com',
            protocol: 'http',
            path: '/',
            currentUrl: `${this.protocol}//${this.hostName}${this.path}`,
            logined: false
        };

        defaults = extend(defaults, options);

        //  console.log(defaults);

        this.username = defaults.username;

        this.email = defaults.email;

        this.pass = defaults.pass;

        this.uid = defaults.uid;

        this.headers = defaults.headers;

        this.cookiesString = defaults.cookiesString;

        this.cookies = defaults.cookies;

        this.logined = defaults.logined;

        this.hostName = defaults.hostName;

        this.protocol = defaults.protocol;

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
                        let founded = _.find(self.cookies, function (item) {
                            return item[key] = key;
                        });
                        if (founded) {
                            self.cookies.splice(self.cookies.indexOf(founded), 1);
                        }
                        return (0);
                    } else {
                        return self.cookies.push(parsed);
                    }
                }
            });

            self.cookiesString = _.reduce(this.cookies, function (sum, value) {
                for (var key in value) {
                    return sum += `${cookie.serialize(key, value[key])}; `;
                }
            }, '');

            console.log(this.cookiesString);
        }
    }

    processResponse(req, res, callback) {

        let self = this;

        console.log(res.statusCode);
        console.log(res.headers);

        self.processCookies(res.headers);

        switch (res.statusCode) {
            case 200:
                self.currentUrl = `${this.protocol}//${this.hostName}${this.path}`;
                break;
            case 302:
                return self.getUrl(res.headers['location'], callback);
            default :
                req.emit('error', new Error(`Неверный код ответа: ${res.statusCode}`));
                return req.abort();
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

        console.log(`getUrl: ${query}`);

        let parsed = url.parse(query);

        this.hostName = parsed.hostname || this.hostName;
        this.protocol = parsed.protocol || this.protocol;
        this.path = parsed.path || '/';

        if (!this.hostName || !this.protocol) {
            return callback(new Error('Неверные параметры'));
        }

        delete this.headers['Content-Type'];
        delete this.headers['Content-Length'];

        this.headers['Cookie'] = this.cookiesString;

        let isSecured = this.protocol === 'https:';

        let requestParams = {
            hostname: this.hostName,
            port: isSecured ? 443 : 80,
            path: this.path,
            headers: this.headers
        };

        console.log(requestParams);

        let req = null;

        if (isSecured) {
            req = https.get(requestParams, function (res) {
                return self.processResponse(req, res, callback);
            })
        } else {
            req = http.get(requestParams, function (res) {
                return self.processResponse(req, res, callback);
            })
        }

        req.on('error', function (err) {
            return callback(err);
        })
    }

    postForm(action, formData, headers, callback) {

        let self = this;

        console.log(`action: ${action} ${formData}`);

        let parsed = url.parse(action);

        this.hostName = parsed.hostname || this.hostName;
        this.protocol = parsed.protocol || this.protocol;
        this.path = parsed.path || '/';

        if (!this.hostName || !this.protocol) {
            return callback(new Error('Неверные параметры'));
        }

        let isSecured = this.protocol === 'https:';

        let requestString = this.buildQuery(formData);

        this.headers['Cookie'] = this.cookiesString;
        this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        this.headers['Content-Length'] = requestString.length;

        this.headers = extend(this.headers, headers);

        let requestParams = {
            host: this.hostName,
            port: isSecured ? 443 : 80,
            path: this.path,
            method: 'POST',
            headers: this.headers
        };

        console.log(requestParams);

        let post_req = null;

        if (isSecured) {
            post_req = https.request(requestParams, function (res) {
                return self.processResponse(post_req, res, callback);
            });
        } else {
            post_req = http.request(requestParams, function (res) {
                return self.processResponse(post_req, res, callback);
            });
        }

        post_req.write(requestString);
        post_req.end();

        post_req.on('error', function (err) {
            return callback(err);
        })
    }

    processContent(content, callback) {
        let self = this;

        console.log('done');
        console.log(content);

        let $ = cheerio.load(content);

        let formData = {};

        let $loginForm = $('form[name=login]');

        if ($loginForm && !this.tryLogin) {

            let action = $loginForm[0].attribs.action;

            $('input', $loginForm).each(function (i, item) {
                if (item.attribs.name) {
                    formData[item.attribs.name] = item.attribs.value || ''
                }
            });

            formData['email'] = self.email;
            formData['pass'] = self.pass;

            console.log(formData);
            console.log(action);

            this.tryLogin = 1;

            return self.postForm(action, formData, {}, function (err, content) {
                if (err) {
                    return callback(err);
                } else {
                    return self.processContent(content, callback);
                }
            });

        }

        let successResult = /parent.onLoginDone\('\/(.*?)'\);/.exec(content);

        if (successResult) {

            let query = `${self.protocol}//vk.com/${successResult[1]}`;
            return self.getUrl(query, function (err, content) {
                if (err) {
                    return callback(err);
                } else {
                    return self.processContent(content, callback);
                }
            });

        }

        let failResult = /parent.onLoginFailed\((.*?)\);/.exec(content);

        if (failResult) {

            let inner = failResult[1];

            if (inner) {

                let parts = inner.split(',');

                switch (parts[0]) {
                    case -1:
                        return self.getUrl(`https://${self.hostName}${self.path}`, function (err, content) {
                            if (err) {
                                return callback(err);
                            } else {
                                return self.processContent(content, callback);
                            }
                        });
                    case 4:
                        let email = eval(`(${parts[1]})`);
                        if (typeof  email == 'object') {
                            return self.getUrl(`${self.protocol}//${self.hostName}/login.php?m=1&email=${email.email}`, function (err, content) {
                                if (err) {
                                    return callback(err);
                                } else {
                                    return self.processContent(content, callback);
                                }
                            });
                        } else {
                            return callback(new Error(''))
                        }
                        break;
                    default:
                        return self.getUrl(`${self.protocol}//${self.hostName}/login.php`, function (err, content) {
                            if (err) {
                                return callback(err);
                            } else {
                                return self.processContent(content, callback);
                            }
                        });
                }
            }
        }

        /*let scripts = $('script');

        scripts.each(function (i, item) {

            let itemContent = $(item).html();
            let index = itemContent.indexOf('var vk = ');

            if (index > -1) {
                itemContent = itemContent.substring(index + 8);
                let obj = self._parseJSON(self._getObj(itemContent));
                if (obj) {

                    this.logined = true;
                    console.log(obj.id);
                }
                return false;
            }
        });*/

        if ($('#logout_link')) {
            return callback(null, 'logined')
        }


        if (this.tryLogin) {
            return callback(new Error(`Neverniy login ili parol'`))
        }

        return callback(new Error(`Unprocesseble`))
    }


    login(callback) {

        let self = this;

        this.clearCookies();

        this.getUrl('http://vk.com', function (err, content) {
            if (err) {
                return callback(err);
            } else {
                return self.processContent(content, callback);
            }
        });
    }

    isLogined() {
        return this.logined;
    }

    saveToDb(callback) {

        dbBrowser.update({
            uid: this.uid
        }, {
            username: this.username,
            email: this.email,
            pass: this.pass,

            logined: this.logined,
            headers: this.headers,
            cookiesString: this.cookiesString,
            cookies: this.cookies,
            hostName: this.hostName,
            protocol: this.protocol,

            uid: this.uid
        }, {
            upsert: true,
            setDefaultsOnInsert: true
        }, function (err) {
            return callback(err ? err : null)
        });

    }

    _parseJSON(string) {
        let result = null;
        try {
            result = JSON.parse(string);
        } catch (e) {
            return null;
        }
        return result;
    }

    _getObj(string) {
        let count = 0;
        let result = null;
        for (var k = 0; k < string.length; k++) {
            if (string[k] === '{') {
                count++;
            } else if (string[k] === '}') {
                count--;
            }
            if (count === 0 && k != 0) {
                result = string.substring(0, ++k);
                break;
            }
        }
        return result;
    }
}


module.exports.get = function (req, res) {


    dbBrowser.findOne({
        username: 'huyax'
    }, function (err, doc) {
        if (err) {
            console.error(err);
        } else {

            let bbrowser = new Browser(doc || {
                    username: 'huyax',
                    email: '89084153026',
                    pass: 'jukebox5653'
                });

            console.log(bbrowser.isLogined());

            async.waterfall([function (callback) {
                if (!bbrowser.isLogined()) {
                    bbrowser.login(function (err, mainpage) {
                        if (err) {
                            return callback(err);
                        } else {
                            console.log(mainpage);

                            bbrowser.logined = true;

                            bbrowser.saveToDb(function (err) {
                                if (err) {
                                    return callback(err);
                                } else {
                                    return callback();
                                }
                            })
                        }
                    })
                } else {
                    return callback();
                }
            }, function (callback) {
                bbrowser.getUrl('http://vk.com/im', function (err, content) {
                    return callback(err ? err : null, content);
                });
            }], function (err, content) {
                if (err) {
                    console.error(err);
                } else {

                    console.log(content);

                    let $ = cheerio.load(content);

                    let scripts = $('script');

                    let im = null;

                    scripts.each(function (i, item) {

                        let itemContent = $(item).html();
                        let index = itemContent.indexOf('IM.init(');

                        if (index > -1) {
                            itemContent = itemContent.substring(index + 8);
                            im = self._getObj(itemContent);
                            return false;
                        }

                    });


                    if (im) {

                        console.log(im);

                        im = bbrowser._parseJSON(im);

                        if (im) {

                            let params = {
                                'act': 'a_check',
                                'ts': im.timestamp,
                                'version': 1,
                                'key': im.key,
                                'wait': 25,
                                'mode': 66
                            };

                            let transport_host = im.transport_frame.match(/http(.*?).com/);

                            let headers = {
                                'Accept': '*/*',
                                'Referer': im.transport_frame.substring(0, im.transport_frame.indexOf('#')),
                                'Origin': transport_host[0],
                                'X-Compress': null,
                                'X-Requested-With': 'XMLHttpRequest'
                            };

                            console.log(params);

                            async.forever(function (next) {
                                bbrowser.postForm(transport_host[0] + '/' + im.url, params, headers, function (err, content) {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        console.log(content);
                                        let o = null;
                                        try {
                                            o = JSON.parse(content);
                                        } catch (e) {
                                            return next(e);
                                        }

                                        if (o) {
                                            if (o.hasOwnProperty('failed')) {
                                                params.ts = o.ts;
                                                return next();
                                            } else {
                                                return next(new Error('error'));
                                            }
                                        } else {
                                            return next(new Error('error'));
                                        }
                                    }
                                });
                            }, function (err) {
                                return callback(err);
                            });
                        } else {
                            return callback(new Error('error'));
                        }
                    } else {
                        return callback(new Error('v'));
                    }
                }
            });
        }
    });


    res.status(200).send('OK');
};
