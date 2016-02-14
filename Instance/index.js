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
            this.accounts.push(newAccount);

            process.send({
                command: 'accountReady', data: {
                    instanceSn: self.sn,
                    uid: newAccount.uid,
                    tasks: []
                }
            });

            return newAccount.init(callback)
        } else {
            intel.debug(`Существующий аккаунт:${data.accountId}`);
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