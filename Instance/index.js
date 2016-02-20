"use strict";

var extend = require('extend'),
    utils = require('modules/utils'),
    uuid = require('node-uuid'),
    Socket = require('Instance/Socket'),
    Account = require('Instance/Account'),

    dbInstance = require('models/instance'),
    dbAccount = require('models/account'),

    async = require('async'),
    intel = require('intel'),
    _ = require('underscore');

class Instance {

    constructor(options) {

        let defaults = {
            sn: null
        };

        extend(defaults, options);

        this.sn = defaults.sn;

        this.accounts = [];
        this.Socket = null;
        this.initialized = false;

        intel.debug(`Создан новый Instance: ${process.pid}:${this.sn}`);
    }

    init(callback) {
        let self = this;

        if (!this.initialized) {

            dbAccount.find({instance: this.sn}, function (err, docs) {
                if (err) {
                    return callback(err);
                } else {
                    return async.each(docs, function (item, callback) {
                        let newAccount = new Account(self, item);
                        self.accounts.push(new Account(self, item));
                        return newAccount.init(callback);
                    }, function (err) {
                        if (err) {
                            return callback(err);
                        } else {
                            self.Socket = new Socket(self).init();
                            return callback();
                        }
                    });
                }
            });

            this.initialized = true;
        }
    }

    addAccount(data, callback) { //username //accountId
        let self = this;
        let account = this.getAccountByCredentials(data);
        if (!account) {
            data.uid = uuid.v1();
            let newAccount = new Account(self, data);
            return newAccount.init((err) => {
                if (err) {
                    return callback(err);
                } else {
                    this.accounts.push(newAccount);
                    return GLOBAL.hub.requestMaster('accountReady', {
                        instanceSn: self.sn,
                        uid: newAccount.uid,
                        tasks: []}, callback);
                }
            })
        } else {
            intel.debug(`Существующий аккаунт: ${data.username}:${data.accountId}`);
            return callback();
        }
    }

    getAccountByCredentials(data) {
        return _.find(this.accounts, function (item) {
            return item.username === data.username && item.accountId === data.accountId;
        })
    }

    getAccountByUid(uid) {
        return _.find(this.accounts, function (item) {
            return item.uid === uid;
        })
    }

    sendError(credetials, error) {
        this.Socket.s.sockets.in(this.Socket.getUserNameString(credetials)).emit('error', error)
    }

    startPauseTask(data) { //username: 'huyax', pageId: 'mainPage', settings: {}
        if (!data.pageId && !data.uid) {
            return this.sendError(data, 'wrong parametres');
        } else {
            if (!data.accountId) {
                return this.sendError(data, 'Не выбран аккаунт');
            } else {
                let account = this.getAccountByCredentials(data);
                if (!account) {
                    intel.error('account not found');
                    return this.sendError(data, 'account not found');
                } else {
                    return account.startPauseTask(data);
                }
            }
        }
    }

    save(callback) {
        let self = this;

        async.each(this.accounts, function (account, callback) {
            return account.save(callback);
        }, function (err) {
            if (err) {
                return callback(err);
            } else {
                return dbInstance.update({
                    sn: self.sn
                }, {
                    sn: self.sn,
                    accounts: _.map(this.accounts, function (account) {
                        return account.uid;
                    })
                }, {
                    upsert: true,
                    setDefaultsOnInsert: true
                }, callback);
            }
        });
    }
}

module.exports = Instance;