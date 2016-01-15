var utils = require('../../modules/utils');
var justExecuteCommand = require('../../vkapi').justExecuteCommand;
var dbUtils = require('../../modules/dbUtils');
var extend = require('extend');
var config = require('config');

var async = require('async');

var gridRefreshItem1 = function (task, callback) {

    console.log('task in');

    var interval = setInterval(function () {

        var state = task.getState();

        switch (state) {
            case 1:
                console.log('working');
                task.pushMesssage(utils.createMsg({msg: 'working'}));
                break;
            case 2:
                console.log('paused');
                task.pushMesssage(utils.createMsg({msg: 'paused'}));
                break;
            case 0:
                console.log('stoped');

                clearInterval(interval);

                return callback(null, {
                    cbType: 0
                });
        }
    }, 1000);

};

var gridRefreshItem = function (task, callback) {

    console.log('task in');

    async.waterfall([function (next) {

        dbUtils.getAccountByCredentials({
            username: task.username,
            accountId: task.accountId
        }, function (err, account) {
            /*if (err) {
             return iteration(err);
             } else if (account) {
             if (!account.proxy || !account.token) {
             return iteration({
             msg: utils.createMsg({msg: 'Akkaunt ne proveren', type: 1})
             })
             } else {
             return iteration(null, account);
             }
             } else {
             return iteration({
             msg: utils.createMsg({msg: 'Akkaunt ne nayden', type: 1})
             })
             }*/
            return next(null, {
                token: 'c8d7eee470f0fe3714263ab5083f462959c40399f17ebcaed9a0e1d5d41a04f755aa458243721a9ef0feb',
                proxy: null
            })
        })

    }, function (account, next) {


        async.eachSeries(task.settings.items, function (item, done) {

            var options = {
                token: account.token,
                proxy: account.proxy,
                command: 'execute',
                options: {}
            };

            switch (task.settings.listType) {
                case 'post':

                    options.command = 'wall.getById';
                    options.options = {
                        posts: item.value.owner_id + '_' + item.value.id
                    };

                    break;
                case 'person':

                    console.log(item.value.id);

                    options.command = 'users.get';
                    options.options = {
                        user_ids: item.value.id,
                        fields: config.get('vk.person.fields')
                    };

                    break;
                default:
                    return done({
                        error: 'error'
                    });
            }


            justExecuteCommand(options, function (err, data) {
                if (err) {
                    return done(err);
                } else if (data &&
                    data.result &&
                    data.result.response) {

                    if (data.result.response.length) {

                        dbUtils.getItemFromDbById(task.settings.listType, item._id, function (err, dbItem) {
                            if (err) {
                                return done(err);
                            } else if (dbItem && dbItem.value) {

                                extend(dbItem.value, data.result.response[0]);

                                console.log(data.result.response[0]);

                                dbItem.markModified('value');

                                dbItem.save(function (err, newItem) {

                                    console.error(err);

                                    task.sendEvent(extend({
                                        eventName: 'refreshRow'
                                    }, newItem));

                                    return done();
                                })

                            } else {
                                return done({error: 'error'});
                            }
                        });
                    } else {
                        console.error('net resultatov');

                        dbUtils.removeItemFromDbById(task.settings.listType, item._id, function (err) {
                            if (err) {
                                return done(err);
                            } else {
                                task.pushMesssage(utils.createMsg({msg: 'Запись не найдена'}));

                                task.sendEvent(extend({
                                    eventName: 'disableRow'
                                }, { _id: item._id }));

                                return done();
                            }
                        });
                    }
                } else {
                    return done({error: 'error'});
                }
            });


        }, function (err) {
            return next(err);
        });

    }], function (err) {

        return callback(err ? err : null, {
            cbType: 0
        })
    });


    /*console.log(task.settings);

     console.log('task out');

     return callback(null, {
     cbType: 0
     });*/

};

module.exports = gridRefreshItem;