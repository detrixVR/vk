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
                            intel.debug('dssssssssssss')
                            self.Socket = new Socket(self);
                            return callback();
                        }
                    });
                }
            });

            this.initialized = true;
        }
    }

    addAccount(data) {
        let self = this;
        let account = this.getAccountByCredentials(data);
        if (account) {
            let newAccount = new Account(data);
            this.accounts.push(newAccount);
            newAccount.init(function (err) {
                if (err) {
                    intel.error('Невозможно создать аккаунт');
                } else {
                    process.send({
                        command: 'accountReady', data: {
                            instanceSn: self.Instance.sn,
                            uid: newAccount.uid,
                            tasks: []
                        }
                    });
                }
            })
        } else {
            intel.warning('Попытка добавить существующий аккаунт');
        }
    }

    getAccountByCredentials(data) {
        return _.find(this.accounts, function (item) {
            return item.username === data.username && item.accountId === data.accountId;
        })
    }

    getAccountByUid(data) {
        return _.find(this.accounts, function (item) {
            return item.uid === data.uid;
        })
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