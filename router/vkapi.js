var async = require('async'),
    Command = require('../vkapi').executeCommand,
    utils = require('../modules/utils');


module.exports.post = function (req, res) {

    var command = req.body.command;
    var options = null;

    try {
        options = JSON.parse(req.body.options);
    } catch (e) {
        res.status(400).json({
            msg: 'Parsing Error'
        });
        return (0);
    }

    console.log(req.body);

    if (!command || !options) {
        res.status(400).json({
            msg: 'Неверный запрос'
        });
        return (0);
    }

    console.log(req.user.username);

    Command({
        command: command,
        options: options
    }, function (err, result) {
        if (err) {
            var resp = utils.processError(err);
            return res.status(resp.status).json(resp);
        } else {
            return res.status(200).json(result);
        }
    });
};