import Page     from './page/page.js';

var pageId      = $('#pageId').text();
var accountId   = $('#accountId').text();
var page        = new Page(pageId, accountId);

page.init();







