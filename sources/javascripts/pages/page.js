"use string"


//import Page from './page';
import Socket from '../socket/socket';
import UI from '../UI/ui';
import Menu from '../menu/menu.js';

class Page {

    constructor() {
        this.accountId = 1;
        this.pageId = 'mainPage';
        this.account = null;
    }

    init() {
        if (!this.initialized) {
            this.UI = new UI(this).init();

            this.UI.overlay('Соединение...');

            this.Socket = new Socket(this).init();

            this.leftMenu = new Menu(this, 'left');
            this.rightMenu = new Menu(this, 'right');

            this.initRequester();

            this.UI.drawAccountInfo();

            this.UI._postInit();

            this.initialized = true;
        }

        return this;
    }

    setInitialAccount() {

    }

    joinAccountPage() {
        let self = this;
        var interval = setInterval(function () {
            console.log('try get');
            if (self.Socket && self.Socket.socket.connected) {

                self.Socket.socket.emit('joinAccountPage', {
                    accountId: self.accountId,
                    pageId: self.pageId
                });

                clearInterval(interval);
            }
        }, 100);
    }

    parseUrl(str) {

        var query, key = ['source', 'scheme', 'authority', 'userInfo', 'user', 'pass', 'host', 'port',
                'relative', 'path', 'directory', 'file', 'query', 'fragment'
            ],
            parser = {
                php: /^(?:([^:\/?#]+):)?(?:\/\/()(?:(?:()(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?()(?:(()(?:(?:[^?#\/]*\/)*)()(?:[^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // Added one optional slash to post-scheme to catch file:/// (should restrict this)
            };

        var m = parser['strict'].exec(str),
            uri = {},
            i = 14;
        while (i--) {
            if (m[i]) {
                uri[key[i]] = m[i];
            }
        }

        delete uri.source;
        return uri;
    }

    parseQuery(search) {

        var args = search.substring(1).split('&');

        var argsParsed = {};

        var i, arg, kvp, key, value;

        for (i = 0; i < args.length; i++) {

            arg = args[i];

            if (-1 === arg.indexOf('=')) {

                argsParsed[decodeURIComponent(arg).trim()] = true;
            }
            else {

                kvp = arg.split('=');

                key = decodeURIComponent(kvp[0]).trim();

                value = decodeURIComponent(kvp[1]).trim();

                argsParsed[key] = value;
            }
        }

        return argsParsed;
    }

    initRequester() {
        this.requester = {
            accounts: {
                _accountsFromCache: function (options) {
                    return this._cache.filter(function (account) {
                        let bool = true;
                        for (var k in options) {
                            bool = options[k] === account[k];
                        }
                        return bool;
                    });
                },
                get: function (options, callback) {
                    let that = this;
                    let accounts = this._accountsFromCache(options);
                    if (accounts.length) {
                        return callback(null, accounts);
                    } else {
                        $.post('/test', options).done(function (data) {
                            data.forEach(function (item) {
                                let founded = _.find(that._cache, function (c) {
                                    return c.id === item.id
                                });
                                if (founded) {
                                    that._cache.splice(that._cache.indexOf(founded), 1, item);
                                } else {
                                    that._cache.push(item);
                                }
                            });
                            return callback(null, that._accountsFromCache(options));
                        }).fail(function (fail) {
                            return callback(fail);
                        });
                    }
                },
                create: function () {

                },
                delete: function () {

                },
                patch: function () {

                },
                _cache: []
            }
        }
    }

    switchAccount(account) {
        if (account && account.accountId) {
            this.accountId = account.accountId;
            this.account = account;
            this.UI.drawAccountInfo();
            this.UI._postInit();
            this.joinAccountPage();
        }
    }

}


export default Page;