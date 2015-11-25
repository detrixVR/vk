import Page     from './page/page.js';
import utils    from './utils'

var pageId      = $('#pageId').text();
var accountId   = $('#accountId').text();
var page        = new Page(pageId, accountId);

page.init();







