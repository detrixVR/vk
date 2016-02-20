
var utils = require('modules/utils');

var proxies = function (Task, callback) {


    console.log('task in');

    var interval = setInterval(function () {

        var state = Task.getState();

        switch (state) {
            case 1:
                console.log('working');
                Task.pushMesssage(utils.createMsg({msg: 'working'}));
                break;
            case 2:
                console.log('paused');
                Task.pushMesssage(utils.createMsg({msg: 'paused'}));
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

module.exports = proxies;
