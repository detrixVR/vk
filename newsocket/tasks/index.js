

var gridRefreshItem = require('newsocket/tasks/gridRefreshItem');
var searchGroups = require('newsocket/tasks/searchGroups');
var searchPeoples = require('newsocket/tasks/searchPeoples');
var proxies = require('newsocket/tasks/proxies');

var messaging = require('newsocket/tasks/messaging');


var listCreatingFromPerson = require('newsocket/tasks/listCreating/listCreatingFromPerson');


module.exports = {
    gridRefreshItem: gridRefreshItem,
    searchGroups: searchGroups,
    searchPeoples: searchPeoples,
    messaging: messaging,
    proxies: proxies
};