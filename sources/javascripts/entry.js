import Page     from './page/page.js';

var accountId   = $('#accountId').text();
var processId   = $('#processId').text();

var page        = new Page(accountId, processId);

page.init();







