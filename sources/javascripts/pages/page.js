"use string"


//import Page from './page';
import Socket from '../socket/socket';
import UI from '../UI/ui';
import Menu from '../menu/menu.js';

class Page {

    constructor() {

    }


    init() {
        if (!this.initialized) {

            this.Socket = new Socket(this).init();
            this.UI = new UI(this).init();
            this.leftMenu = new Menu(this, 'left');
            this.rightMenu = new Menu(this, 'right');

            this.UI.overlay('Соединение...');

            let parsedURL = this.parseUrl(window.location);
            let parsedQUERY = this.parseQuery(window.location.search);

            switch (parsedURL.path.substring(1)) {
                case '':
                    this.pageId = 'mainPage';
                    break;
                case 'test':
                    this.pageId = 'test';
                    break;
                case 'admin':
                    this.pageId = 'adminPanel';
                    break;
                case 'proxies':
                    this.pageId = 'validateProxies';
                    break;
                case 'accounts':
                    this.pageId = 'validateAccounts';
                    break;
                case 'peoples':
                    this.pageId = 'searchPeoples';
                    break;
                case 'groups':
                    this.pageId = 'searchGroups';
                    break;
                case 'lists':
                    this.pageId = 'listCreatingFromPerson';

                    switch (parsedQUERY.type) {
                        case 'group':
                            this.pageId = 'listCreatingFromGroup';
                            break;
                        case 'audio':
                            this.pageId = 'listCreatingFromAudio';
                            break;
                        case 'video':
                            this.pageId = 'listCreatingFromVideo';
                            break;
                        case 'post':
                            this.pageId = 'listCreatingFromPost';
                            break;
                    }
                    break;
                case 'tasks':
                    this.pageId = 'taskExecution';
                    break;
                case 'config':

                    this.pageId = 'configurationClean';

                    switch (parsedQUERY.type) {
                        case 'copy':
                            this.pageId = 'configurationCopy';
                            break;
                        case 'group':
                            this.pageId = 'configurationGroup';
                            break;
                    }
                    break;
            }

            this.accountId = +parsedQUERY.account || 10000000;

            console.log(this.pageId);
            console.log(this.accountId);

            // this.getCurrentTask();

            this.initRequester();

            this.initialized = true;
        }

        return this;
    }

    joinToAccount() {
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
            this.joinToAccount();
        }
    }

}


export default Page;