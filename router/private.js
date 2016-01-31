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
            vkObj: {},
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

        this.vkObj = defaults.vkObj;

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

    processContentLogin(content, callback) {

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
                    return self.processContent(content, 'login', callback);
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
                    return self.processContent(content, 'login', callback);
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
                                return self.processContent(content, 'login', callback);
                            }
                        });
                    case 4:
                        let email = eval(`(${parts[1]})`);
                        if (typeof  email == 'object') {
                            return self.getUrl(`${self.protocol}//${self.hostName}/login.php?m=1&email=${email.email}`, function (err, content) {
                                if (err) {
                                    return callback(err);
                                } else {
                                    return self.processContent(content, 'login', callback);
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
                                return self.processContent(content, 'login', callback);
                            }
                        });
                }
            }
        }

        let scripts = $('script');

        let vkObj = null;

        scripts.each(function (i, item) {

            let itemContent = $(item).html();
            let index = itemContent.indexOf('var vk = ');

            if (index > -1) {
                itemContent = itemContent.substring(index + 9);
                let textObj = self._getObj(itemContent);
                vkObj = eval(`(${textObj})`);
                if (vkObj) {
                    console.log(vkObj.id);
                }
                return false;
            }
        });

        if ($('#logout_link')) {

            this.logined = true;
            this.vkObj = vkObj;

            return callback(null, content);
        }


        if (this.tryLogin) {
            return callback(new Error(`Neverniy login ili parol'`));
        }

        return callback(new Error(`Unprocesseble`));
    }

    processContentIm(content, callback) {

        let self = this;

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

            im = self._parseJSON(im);

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

                return callback(null, {
                    headers: headers,
                    params: params,
                    query: transport_host[0] + '/' + im.url
                });


            } else {
                return callback(new Error('error'));
            }
        } else {
            return callback(new Error('v'));
        }
    }

    _getFastChat(callback) {

        let self = this;

        let params = {
            'act': 'a_get_fast_chat',
            'al': '1'
        };

        let headers = {
            'Accept': '*/*',
            'Referer': `${self.currentUrl}`,
            'Origin': `${self.protocol}//vk.com`,
            'X-Compress': null,
            'X-Requested-With': 'XMLHttpRequest'
        };

        self.postForm(`${self.protocol}//vk.com/al_im.php`, params, headers, function (err, answer) {
            if (err) {
                return callback(err);
            } else {
                console.log(answer);

                return callback(null, utils.processVkResponse(answer));
            }
        });
    }

    _checkEvents(options, callback) {

        let self = this;

        self.postForm(options.query, options.params, options.headers, function (err, content) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, content);
            }
        });
    }

    processContentLiving(content, callback) {
        let self = this;

        console.log(content);

        let $ = cheerio.load(content);

        let scripts = $('script');

        let notifier = null;

        scripts.each(function (i, item) {
            let itemContent = $(item).html();
            let index = itemContent.indexOf('Notifier.init(');
            if (index > -1) {
                itemContent = itemContent.substring(index + 14);
                notifier = self._getObj(itemContent);
                return false;
            }
        });

        if (notifier) {

            console.log(notifier);

            notifier = self._parseJSON(notifier);

            if (notifier) {

                return callback(null, {
                    notifier: notifier
                })

            } else {
                return callback(new Error('error'));
            }
        } else {
            return callback(new Error('v'));
        }
    }

    processContent(content, type, callback) {

        let self = this;

        switch (type) {
            case 'login':
                return self.processContentLogin(content, callback);
            case 'im':
                return self.processContentIm(content, callback);
            case 'mainpage':
                return self.processContentLiving(content, callback);
            default:
                return callback(new Error('unknow type for process'));
        }
    }

    checkLogin(callback) {

        let self = this;

        if (!self.isLogined()) {
            self._login(function (err, mainpage) {
                if (err) {
                    return callback(err);
                } else {
                    self.saveToDb(function (err) {
                        if (err) {
                            return callback(err);
                        } else {
                            return callback(null, mainpage);
                        }
                    });
                }
            })
        } else {
            return callback(null, null);
        }
    }

    _sendMsg(options, callback) {

        let self = this;

        /*let params = {
         'act': 'a_send',
         'al': 1,
         'gid': 0,
         'guid': 12.5614364427,
         'hash': 'c68aa0486c920b5327',
         'media': '',
         'msg': 'eto horosho',
         'title': '',
         'to': options.id,
         'ts': 1772978066
         };*/

        let params = {
            'act': 'a_send',
            'al': 1,
            'chas': '4ce2103ab80bd77ae3',
            'from': 'box',
            'media': '',
            'message': 'sdsd',
            'title': '',
            'to_ids': 325876997
        };

        let headers = {
            'Accept': '*.*',
            'Referer': `${self.protocol}//vk.com/im?sel=${options.id}`,
            'Origin': `${self.protocol}//vk.com`,
            'X-Compress': null,
            'X-Requested-With': 'XMLHttpRequest'
        };

        self.postForm(`${self.protocol}//vk.com/al_im.php`, params, headers, function (err, content) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, content);
            }
        });
    }

    _getDialogs(options, callback) {

        let self = this;

        let params = {
            'act': 'a_get_dialogs',
            'ads_section': 'im',
            'ads_showed': '',
            'al': 1,
            'al_ad': 1,
            'gid': 0,
            'offset': 0,
            'unread': ''
        };

        let headers = {
            'Accept': '*/*',
            'Origin': 'http://vk.com',
            // 'Referer': 'http://vk.com/im?sel=275667666',
            'X-Compress': null,
            'X-Requested-With': 'XMLHttpRequest'
        };

        let query = 'http://vk.com/al_im.php';


        self.postForm(query, params, headers, function (err, content) {


            let processed = utils.processVkResponse(content);

            if (processed && processed[5] && processed[5].dialogs_members) {

                console.log(processed);

                let dialogMembers = self._parseJSON(processed[5].dialogs_members);

                return callback(null, dialogMembers);
            } else {
                return callback(new Error('error'));
            }
        });
    }


    living(callback) {

        let self = this;

        async.waterfall([function (callback) {
            return self.checkLogin(callback);
        }, function (mainpage, callback) {

            if (mainpage) {
                self.processContent(mainpage, 'mainpage', callback);
            } else {
                self.getUrl(`http://vk.com/id${self.vkObj.id}`, function (err, content) {
                    if (err) {
                        return callback(err);
                    } else {
                        return self.processContent(content, 'mainpage', callback);
                    }
                });
            }
        }], function (err, options) {
            if (err) {
                return callback(err);
            } else {


                console.log(options);


                if (options && options.notifier) {

                    let notifier = options.notifier;

                    async.waterfall([
                        function (callback) {
                            return self._getFastChat(callback);
                        }
                    ], function (err, fastchat) {
                        if (err) {
                            return callback(err);
                        } else {

                            if (fastchat && fastchat[5]) {

                                let fastChat = fastchat[5];

                                let tss = `${notifier.timestamp}_${fastChat.im_queue.ts}_${fastChat.cl_queue ? fastChat.cl_queue.ts : ''}`;
                                let keys = `${notifier.key}${fastChat.im_queue.key}${fastChat.cl_queue ? fastChat.cl_queue.key : ''}`;


                                let params = {
                                    'act': 'a_check',
                                    'id': notifier.uid,
                                    'key': keys,
                                    'ts': tss,
                                    'wait': 25
                                };

                                let headers = {
                                    'Accept': '*/*',
                                    'Referer': notifier.frame_path,
                                    'Origin': notifier.frame_path.substring(0, notifier.frame_path.indexOf('.com') + 4),
                                    'X-Compress': null,
                                    'X-Requested-With': 'XMLHttpRequest'
                                };


                                async.forever(function (next) {

                                    console.log(params);

                                    self._checkEvents({
                                        query: notifier.server_url,
                                        params: params,
                                        headers: headers
                                    }, function (err, content) {
                                        if (err) {
                                            return next(err);
                                        } else {
                                            console.log(content);

                                            let o = self._parseJSON(content);

                                            if (o && !utils.isArray(o)) {
                                                o = [o];
                                            }

                                            if (o) {

                                                if (!utils.isArray(o)) {
                                                    o = [0];
                                                }

                                                let error = null;

                                                _.forEach(o, function (item) {
                                                    if (item.hasOwnProperty('failed')) {

                                                        if (item.err) {
                                                            error = new Error('error');
                                                            return false;
                                                        }

                                                        switch (item.failed) {
                                                            case 1:
                                                                params.ts = item.ts;
                                                                error = new Error('params.ts = item.ts');
                                                                return false;
                                                            default:
                                                                error = new Error('default');
                                                                return false;
                                                        }
                                                    } else if (item.hasOwnProperty('events')) {

                                                        _.forEach(item.events, function (item) {
                                                            let parsed = utils.processVkResponse(item);

                                                            if (parsed) {
                                                                console.log(parsed);

                                                                switch (parsed[1]) {
                                                                    case 'friend_request':
                                                                        break;
                                                                    case 'new':
                                                                        console.log(`${parsed[1]}: msg from id${parsed[2]}: ${parsed[5]}`);
                                                                        break;
                                                                    default:
                                                                        console.log('unprocesseble event');
                                                                }
                                                            }
                                                        })

                                                    }
                                                });

                                                if (error) {
                                                    return next(error);
                                                }


                                                let str = _.reduce(o, function (sum, item) {
                                                    return sum += `${item.ts}_`;
                                                }, '');

                                                if (str[str.length - 1] == '_') {
                                                    str = str.substring(0, str.length - 1);
                                                }

                                                params.ts = str;

                                                //console.log(params);

                                                return next();


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
                        }
                    });
                } else {
                    return callback(new Error('error'));
                }
            }
        });
    }

    _login(callback) {

        let self = this;

        this.clearCookies();

        this.getUrl('http://vk.com', function (err, content) {
            if (err) {
                return callback(err);
            } else {
                return self.processContent(content, 'login', callback);
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

            vkObj: this.vkObj,

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

    let email = '89084153026';
    let pass = 'jukebox5653';
    let username = 'huyax';


    /*dbBrowser.findOne({
     username: username,
     email: email
     }, function (err, doc) {
     if (err) {
     console.error(err);
     } else {

     let bbrowser = new Browser(doc || {
     username: username,
     email: email,
     pass: pass
     });

     /* bbrowser.living(function (err) {
     console.error(err);
     });/

     bbrowser._getDialogs({}, function (err, dialogMembers) {
     if (err) {
     console.error(err);
     } else {
     console.log(dialogMembers);
     }
     })

     }
     });*/


    res.render('private', {
        user: req.user,
        page: 'private'
    });
};

let dbUtils = require('modules/dbUtils');

module.exports.post = function (req, res) {

    let username = req.user.username;
    let account = req.body.account;

    if (account) {

        async.waterfall([
            function (callback) {

                return dbUtils.getAccountByOptions({
                    username: username,
                    accountId: accountId
                }, callback);

            }, function (account, callback) {

                if (account) {

                    switch (req.body.command) {
                        case 'getDialogs':
                            break;
                        case 'getMessages':
                            break;
                        default:
                            return callback(new Error('unknow command'))
                    }

                } else {
                    return callback(new Error('account ne nayden'))
                }

            }], function (err) {

        });

    } else {
        res.status(400).json({
            msg: 'wrong parametres'
        })
    }
};
/*

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
 if (err) {
 return callback(err);
 } else {
 return bbrowser.processContentIm(content, callback);
 }
 });
 }], function (err, options) {
 if (err) {
 console.error(err);
 } else {

 async.forever(function (next) {

 bbrowser.postForm(options.query, options.params, options.headers, function (err, content) {
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
 options.params.ts = o.ts;
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
 console.error(err);
 });

 }
 });*/