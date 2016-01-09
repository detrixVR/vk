"use strict";


var utils = require('../../modules/utils'),
    async = require('async'),
    extend = require('extend');

var PersonGrid = require('../../models/grid/person').PersonGrid;
var GroupGrid = require('../../models/grid/group').GroupGrid;
var PostGrid = require('../../models/grid/post').PostGrid;
var PhotoGrid = require('../../models/grid/photo').PhotoGrid;
var VideoGrid = require('../../models/grid/video').VideoGrid;

var executeCommand = require('../../vkapi').executeCommand;

var validationModel = {
    fromLatest: {
        name: 'Таймаут',
        validate: function (value) {
            return false;
        }
    },
    exactSelector: {
        name: 'Количество',
        validate: function (value) {
            return false;
        }
    },
    fromSelector: {
        name: 'Страна',
        validate: function (value) {
            return false;
        }
    },
    onlyOwner: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    groupGrid: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    personGrid: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },

    replaceSelector: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    targetSelect: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    whatSelector: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    queryString: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    }
};

var taskExecuting = function (processes, credentials, settings, callback) {

    callback(null, { //start process
        cbType: 2,
        msg: utils.createMsg({msg: 'taskExecuting', type: 2, clear: true})
    });

    var error = utils.validateSettings(settings, validationModel);

    if (error) {
        return callback(null, {
            cbType: 0,
            msg: utils.createMsg({msg: error.msg, clear: true, type: 1}),
            badFields: error.badFields
        })
    }

   // switch (settings.)


};

module.exports = taskExecuting;