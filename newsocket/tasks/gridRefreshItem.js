
var utils = require('../../modules/utils');

var gridRefreshItem = function(task, callback){

    console.log('task in');

    var interval =  setInterval(function(){

        var state = task.getState();

        switch(state) {
            case 1:
                console.log('working');
                task.pushMesssage(utils.createMsg({msg:'working'}));
                break;
            case 2:
                console.log('paused');
                task.pushMesssage(utils.createMsg({msg:'paused'}));
                break;
            case 0:
                console.log('stoped');

                clearInterval(interval);

                return callback(null, {
                    cbType: 0
                });
        }
    },1000);

};

module.exports = gridRefreshItem;