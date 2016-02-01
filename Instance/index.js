"use strict";

var extend = require('extend'),
    utils = require('modules/utils'),
    uuid = require('node-uuid'),
    Socket = require('newsocket/Classes/Socket'),
    Account = require('newsocket/Classes/Account'),
    dbInstance = require('models/instance'),
    async = require('async'),
    intel = require('intel'),
    _ = require('underscore');

class Instance {

    constructor(options) {

        let defaults = {
            sn: null,
            accounts: []
        };

        extend(defaults, options);

        this.sn = defaults.sn;
        this.accounts = defaults.accounts;
        this.Socket = null;

        this.initialized = false;

        intel.debug(`Создан новый Instance: ${process.pid}:${this.sn}`);
    }

    init() {
        if (!this.initialized) {

            this.Socket = new Socket();

            this.initialized = true;
        }
    }

    addAccount(data) {
        let account = this.getAccountByCredentials(data);
        if (account) {
            this.accounts.push(new Account(data));
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
                dbInstance.update({
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