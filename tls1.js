
if (parent && parent != window && (browser.msie || browser.opera || browser.mozilla || browser.chrome || browser.safari || browser.iphone)) {
    document.getElementsByTagName('body')[0].innerHTML = '';
} else {
    domReady();
    updateMoney(0);
    gSearch.init();
    if (window.qArr && qArr[5]) qArr[5] = [5, "по товарам", "", "goods", 0x00000100];
    if (browser.iphone || browser.ipad || browser.ipod) {
        setStyle(bodyNode, {webkitTextSizeAdjust: 'none'});
    }
    if (0) {
        hide('support_link_td');
    }
    var ts_input = ge('ts_input'), oldFF = browser.mozilla && parseInt(browser.version) < 8;
    if (browser.mozilla && !oldFF) {
        setStyle(ts_input, {padding: (vk.rtl ? '3px 20px 6px 40px' : '3px 41px 6px 20px')});
    }
    placeholderSetup(ts_input, {back: false, reload: true});
    if (browser.opera || browser.msie || browser.mozilla) {
        setStyle(ts_input, {padding: (vk.rtl ? '4px 20px 5px 40px' : '4px 41px 5px 20px')});
    } else if (browser.chrome || browser.safari) {
        setStyle(ts_input, {padding: (vk.rtl ? '4px 21px 5px 40px' : '4px 40px 5px 21px')});
    }

    TopSearch.init();
    if (browser.msie8 || browser.msie7) {
        var st = {border: '1px solid #a6b6c6'};
        if (hasClass(ge('ts_wrap'), 'vk')) {
            if (vk.rtl) st.left = '1px';
            else st.right = '0px';
        } else {
            if (vk.rtl) st.right = '146px';
            else st.left = '146px';
        }
        setStyle(ge('ts_cont_wrap'), st);
    }
    window.tsHintsEnabled = 1;;shortCurrency();
    setTimeout(zNav.pbind({}, {queue:1}), 0);
    handlePageParams({"id":275667666,"pads":1,"leftblocks":"<div id=\"left_friends\">\n  <span id=\"left_block6_148246060\" class=\"left_friend_block\" style=\"\">\n<a class=\"ad_box_new ad_box_friend\" href=\"\/wasabi666\" onmouseover=\"leftBlockOver('_fr_148246060')\" onmouseout=\"leftBlockOut('_fr_148246060')\">\n  <div id=\"left_hide_fr_148246060\" class=\"left_hide_button\" onmouseover=\"leftBlockOver(this)\" onmouseout=\"leftBlockOut(this)\" onclick=\"cancelEvent(event); return leftBlockFriendHide('6_148246060', '6_148246060:0', 'c96c6ede6de09de87d');\"><\/div>\n  <div class=\"ad_title_new\">Адель Самара<\/div>\n  <div class=\"ad_domain_new\">1 общий друг<\/div>\n  <div class=\"ad_body\">\n    <img src=\"http:\/\/cs627619.vk.me\/v627619060\/377d9\/_-kaOYlNC78.jpg\" width=\"90\" \/>\n  <\/div>\n<\/a>\n<span id=\"left_friend_status_148246060\" class=\"ad_box_new ad_box_friend_act\">\n  <a href=\"\" onclick=\"leftBlockToggleFriend(148246060, 0 ,'7b288857332504a5ba', 1, event)\">Добавить в друзья<\/a>\n<\/span>\n<\/span><span id=\"left_block6_110301084\" class=\"left_friend_block\" style=\"\">\n<a class=\"ad_box_new ad_box_friend\" href=\"\/hobbyfishing\" onmouseover=\"leftBlockOver('_fr_110301084')\" onmouseout=\"leftBlockOut('_fr_110301084')\">\n  <div id=\"left_hide_fr_110301084\" class=\"left_hide_button\" onmouseover=\"leftBlockOver(this)\" onmouseout=\"leftBlockOut(this)\" onclick=\"cancelEvent(event); return leftBlockFriendHide('6_110301084', '6_110301084:0', '9826547c1cf9727742');\"><\/div>\n  <div class=\"ad_title_new\">Лёша Долгих<\/div>\n  <div class=\"ad_domain_new\">1 общий друг<\/div>\n  <div class=\"ad_body\">\n    <img src=\"http:\/\/cs622628.vk.me\/v622628084\/52c35\/gvfLyMBMBDk.jpg\" width=\"90\" \/>\n  <\/div>\n<\/a>\n<span id=\"left_friend_status_110301084\" class=\"ad_box_new ad_box_friend_act\">\n  <a href=\"\" onclick=\"leftBlockToggleFriend(110301084, 0 ,'9a8211af0a0fdc4687', 1, event)\">Добавить в друзья<\/a>\n<\/span>\n<\/span><span id=\"left_block6_7591184\" class=\"left_friend_block\" style=\"display: none;\">\n<a class=\"ad_box_new ad_box_friend\" href=\"\/id7591184\" onmouseover=\"leftBlockOver('_fr_7591184')\" onmouseout=\"leftBlockOut('_fr_7591184')\">\n  <div id=\"left_hide_fr_7591184\" class=\"left_hide_button\" onmouseover=\"leftBlockOver(this)\" onmouseout=\"leftBlockOut(this)\" onclick=\"cancelEvent(event); return leftBlockFriendHide('6_7591184', '6_7591184:1', '5b2bf7728990fd96a8');\"><\/div>\n  <div class=\"ad_title_new\">Анастасия Щербелёва<\/div>\n  \n  <div class=\"ad_body\">\n    <img src=\"http:\/\/cs629127.vk.me\/v629127184\/2ec63\/0RpUoKElVtQ.jpg\" width=\"90\" \/>\n  <\/div>\n<\/a>\n<span id=\"left_friend_status_7591184\" class=\"ad_box_new ad_box_friend_act\">\n  <a href=\"\" onclick=\"leftBlockToggleFriend(7591184, 1 ,'f27960d6b7a3bfccb6', 1, event)\">Добавить в друзья<\/a>\n<\/span>\n<\/span><div id=\"left_friend_all_link\" class=\"left_friend_all_link\">\n  <a class=\"left_friend_all_lnk\" href=\"\/friends?act=find\">Все возможные друзья<\/a>\n<\/div>\n<\/div>","leftads":"","ads_can_show":"1","ads_section":"profile_self","no_ads":1,"level":2,"loc":"?subdir=katemicha","wrap_page":1,"width":791,"width_dec":160,"width_dec_footer":130,"body_class":"is_rtl font_default pads ","counters":"0,0,0,1,-1,0,-1,-1,0,0,0,-1,-1","pvbig":0,"pvdark":1});addEvent(document, 'click', onDocumentClick);
    cur.lang = extend(cur.lang || {}, {
        wall_my_friends_only: 'Эта запись видна только Вашим друзьям',
        show_full: 'Показать подробную информацию',
        hide_full: 'Скрыть подробную информацию',
        change_current_info: 'изменить статус',
        share_current_info: 'Рассказать друзьям',
        wall_link_label: 'Ссылка',
        create_poll: 'Опрос',
        dont_attach: 'Не прикреплять',
        attachments_limit: ["","Одна запись не может содержать более %s вложения.","Одна запись не может содержать более %s вложений.","Одна запись не может содержать более %s вложений."],
        publish_postponed_title: 'Подтверждение действия',
        publish_postponed_confirm: 'Вы действительно хотите опубликовать отложенную запись прямо сейчас?',
        publish_postponed_btn: 'Опубликовать',
        profile_gifts_hide_button: 'Скрыть подарки',
        profile_sure_hide_gifts: 'Вы уверены, что хотите <b>скрыть подарки</b>?<br><br>Вы всегда сможете вернуть их на свою страницу в разделе {link}<b>Мои Настройки</b>{/link}  на вкладке {link1}<b>Приватность</b>{/link1}.',
        profile_photo_hide: 'Скрыть',
        global_store_stickers: 'Магазин стикеров',
        global_store_stickers_new_available: 'Доступны новые стикеры',
        global_link_choose_own_photo: 'Выбрать свою иллюстрацию',
        global_link_remove_photo: 'Убрать иллюстрацию',
    });
    Profile.init({"user_id":275667666,"loc":"katemicha","back":"Kate Micha","reply_names":[],"max_post_len":280,"post_hash":"7abfbaf24cf1e18859","media_types":[["photo","Фотографию"],["video","Видеозапись"],["audio","Аудиозапись"],["graffiti","Граффити"],["note","Заметку"],["doc","Документ"],["map","Карту"],["poll","Опрос",{"lang":{"q":"Тема опроса","a":"Варианты ответа","i":"Добавить вариант","d":"Удалить вариант","c":"Анонимное голосование"}}],["postpone","Таймер",{"lang":{"profile_choose_timer":"Время публикации","profile_wall_postpone_at":"в","profile_wall_postpone_btn":"В очередь","export_to_twitter":"экспорт в Twitter","export_to_facebook":"экспорт в Facebook","friends_only":"только для друзей"},"date":1454236322}]],"wall_type":"all","wall_no":"Нет записей","wall_counts":["","%s запись","%s записи","%s записей"],"all_link":"к записям Kate","own_link":"ко всем записям","rmedia_types":[["photo","Фотографию"],["video","Видеозапись"],["audio","Аудиозапись"],["graffiti","Граффити"],["note","Заметку"],["doc","Документ"],["map","Карту"],["poll","Опрос",{"lang":{"q":"Тема опроса","a":"Варианты ответа","i":"Добавить вариант","d":"Удалить вариант","c":"Анонимное голосование"}}],["postpone","Таймер",{"lang":{"profile_choose_timer":"Время публикации","profile_wall_postpone_at":"в","profile_wall_postpone_btn":"В очередь","export_to_twitter":"экспорт в Twitter","export_to_facebook":"экспорт в Facebook","friends_only":"только для друзей"},"date":1454236322}]],"share":{"url":"http:\/\/cs539407.vk.com\/upload.php","hash":"47c6c24f15eaec42ca3a5a0ed2962e07","rhash":"9172716131eadd689b3f71cc23cf9c9e","timehash":"1454221922_a284a844b0e1c61590"},"upload":{"url":"http:\/\/cs627926.vk.com\/upload.php","params":{"act":"do_add","aid":-14,"gid":0,"mid":275667666,"hash":"c0c5af0a8e9d255b8e5220424039eec4","rhash":"cfdd7f7b04f06787f15cde2cd9348eef","vk":1,"from_host":"vk.com"},"opts":{"server":"627926","default_error":1,"error_hash":"179165a590c7ba05e2da8c64476b06e6","ext_re":"\\.(gif|jpg|jpeg|png)$","lang":{"max_files_warning":"Вы можете прикрепить к сообщению не более 10 файлов.","wall_drop_photos_here":"Перенесите сюда фотографии, чтобы прикрепить их к записи","wall_release_photos_here":"Отпустите клавишу мыши, чтобы прикрепить фотографии","wall_photos_drag_hint":"Сюда можно перетаскивать фотографии"}}},"info":["<div class=\"profile_info\"><div class=\"clear_fix \">\n  <div class=\"label fl_l\">День рождения:<\/div>\n  <div class=\"labeled fl_l\"><a href=\"\/search?c[section]=people&c[bday]=3&c[bmonth]=8\">3 августа<\/a> <a href=\"\/search?c[section]=people&c[byear]=1989\">1989 г.<\/a><\/div>\n<\/div><div class=\"clear_fix miniblock\">\n  <div class=\"label fl_l\">Семейное положение:<\/div>\n  <div class=\"labeled fl_l\"><a href=\"\/search?c[name]=0&c[section]=people&c[status]=1\">не замужем<\/a><\/div>\n<\/div><div class=\"clear_fix miniblock\">\n  <div class=\"label fl_l\">Языки:<\/div>\n  <div class=\"labeled fl_l\"><a href=\"\/search?c[name]=0&c[section]=people&c[lang]=-1\">Русский<\/a><\/div>\n<\/div><\/div><a class=\"profile_info_link noselect\" onclick=\"Profile.showFull(275667666, 'ru', 0)\">Показать подробную информацию<\/a>","<div class=\"profile_info\"><div class=\"clear_fix \">\n  <div class=\"label fl_l\">День рождения:<\/div>\n  <div class=\"labeled fl_l\"><a href=\"\/search?c[section]=people&c[bday]=3&c[bmonth]=8\">3 августа<\/a> <a href=\"\/search?c[section]=people&c[byear]=1989\">1989 г.<\/a><\/div>\n<\/div><div class=\"clear_fix miniblock\">\n  <div class=\"label fl_l\">Семейное положение:<\/div>\n  <div class=\"labeled fl_l\"><a href=\"\/search?c[name]=0&c[section]=people&c[status]=1\">не замужем<\/a><\/div>\n<\/div><div class=\"clear_fix miniblock\">\n  <div class=\"label fl_l\">Языки:<\/div>\n  <div class=\"labeled fl_l\"><a href=\"\/search?c[name]=0&c[section]=people&c[lang]=-1\">Русский<\/a><\/div>\n<\/div><\/div><a class=\"profile_info_link noselect\" onclick=\"Profile.hideFull()\">Скрыть подробную информацию<\/a>"],"mail_cache":"","fr_click":"eb9470dfe586f67bed,325876997,15086040","wall_tpl":{"reply_form":"<div id=\"reply_box%post_id%\" class=\"reply_box clear_fix\" onclick=\"return cancelEvent(event)\">\n  <a class=\"reply_form_image\" href=\"\/katemicha\"><img src=\"http:\/\/cs629430.vk.me\/v629430666\/27f9b\/AiYUGvlPrGg.jpg\" class=\"reply_form_img\" \/><\/a>\n  <div class=\"reply_form\">\n    <input type=\"hidden\" id=\"reply_to%post_id%\" value=\"\" \/>\n    <div class=\"reply_field_wrap clear_fix\">\n      <div class=\"reply_field_tail\"><\/div>\n\n      <div id=\"reply_smile%post_id%\" title=\"Используйте TAB, чтобы быстрее открывать смайлы\" class=\"emoji_smile fl_l\" onmouseover=\"return Wall.emojiShowTT('%post_id%', this, event);\" onmouseout=\"return Wall.emojiHideTT('%post_id%', this, event);\" onmousedown=\"return cancelEvent(event);\"><div class=\"emoji_smile_icon_on\"><\/div><div class=\"emoji_smile_icon\"><\/div><\/div>\n\n      <div id=\"reply_field%post_id%\" class=\"fl_l reply_field\" onfocus=\"return Wall.showEditReply('%post_id%', event);\" contenteditable=\"true\" placeholder=\"Комментировать..\"><\/div>\n    <\/div>\n    <div id=\"reply_media_preview%post_id%\" class=\"reply_media_preview clear_fix media_preview\"><\/div>\n    <div class=\"reply_warn clear\" id=\"reply_warn%post_id%\"><\/div>\n    <div id=\"submit_reply%post_id%\" class=\"submit_reply clear\">\n      <div class=\"fl_l reply_button_wrap\"><button class=\"flat_button\" id=\"reply_button%post_id%\" onclick=\"wall.sendReply('%post_id%', event);\" onmouseover=\"wall.replySubmitTooltip('%post_id%', 1, this);\" onmouseout=\"wall.replySubmitTooltip('%post_id%', 0, this);\">Отправить<\/button><\/div>\n      <div class=\"reply_as_group_wrap fl_l \">\n        <div class=\"checkbox\" id=\"reply_as_group%post_id%\" onclick=\"wall.replyAsGroup(this, 'http:\/\/cs629430.vk.me\/v629430666\/27f9b\/AiYUGvlPrGg.jpg');\"><div><\/div><span class=\"reply_as_group_long\">от имени сообщества<\/span><span class=\"reply_as_group_short\">от сообщества<\/span><\/div>\n      <\/div>\n      <div id=\"reply_to_title%post_id%\" class=\"reply_to_title fl_l\"><\/div>\n      <div id=\"reply_media_lnk%post_id%\" class=\"reply_media_lnk fl_r\"><span class=\"add_media_lnk\">Прикрепить<\/span><\/div>\n    <\/div>\n  <\/div>\n<\/div>","reply_multiline":false,"reply_multiline_intro":true,"reply_fast":"<div id=\"post%reply_id%\" class=\"reply reply_dived clear \" onmouseover=\"wall.replyOver('%reply_id%')\" onmouseout=\"wall.replyOut('%reply_id%')\" >\n  <div class=\"reply_table\">\n    <a class=\"reply_image\" href=\"\/katemicha\">\n      <img src=\"http:\/\/cs629430.vk.me\/v629430666\/27f9b\/AiYUGvlPrGg.jpg\" width=\"50\" height=\"50\" class=\"reply_image\" \/>\n    <\/a>\n    <div class=\"reply_info\" >\n      \n      <div class=\"reply_text\" >\n        <a class=\"author\" href=\"\/katemicha\" data-from-id=\"0\">Kate Micha<\/a> <div class=\"wall_reply_text\">%message%<\/div>\n      <\/div>\n      <div class=\"info_footer sm\" id=\"wpe_bottom%reply_id%\">\n        \n        %date%\n      <\/div>\n    <\/div>\n  <\/div>\n<\/div>","reply_multiline_hint":"<div class=\"reply_submit_tail_wrap\"><div class=\"reply_submit_tail\"><\/div><\/div>\n<div class=\"reply_submit_hint_wrap\" onclick=\"event.cancelBubble = true;\">\n  <div class=\"reply_submit_hint_title\">Настройки отправки<\/div>\n  <div id=\"reply_submit_hint_opts\">\n    <div class=\"radiobtn %disabled%\" onclick=\"radiobtn(this, 0, 'reply_submit'); wall.onReplySubmitChanged(0);\"><div><\/div><b>Enter<\/b> — отправка сообщения<br><b>Shift+Enter<\/b> — перенос строки<\/div>\n    <div class=\"radiobtn %enabled%\" onclick=\"radiobtn(this, 1, 'reply_submit'); wall.onReplySubmitChanged(1);\"><div><\/div><b>Ctrl+Enter<\/b> — отправка сообщения<br><b>Enter<\/b> — перенос строки<\/div>\n  <\/div>\n<\/div>","own_reply_link":"<span class=\"divide\">|<\/span><a class=\"reply_link\" onclick=\"Wall.likeShareCustom('%post_id%')\">Ответить<\/a>","edit_link":"<span class=\"divide\">|<\/span><a onclick=\"wall.editPost('%post_id%')\">Редактировать<\/a>","post":"<div id=\"post%post_id%\" class=\"post\" onmouseover=\"wall.postOver('%post_id%')\" onmouseout=\"wall.postOut('%post_id%')\" onclick=\"wall.postClick('%post_id%', event);\" >\n  <div class=\"post_table\">\n    <div class=\"post_image\">\n      <a class=\"post_image\" href=\"%link%\"><img src=\"%photo%\" data-post-id=\"%post_id%\" width=\"50\" height=\"50\"\/><\/a>\n      %online%\n    <\/div>\n    <div class=\"post_info\">\n      %actions%\n      <div class=\"wall_text\"><div class=\"wall_text_name\">%name%<\/div> %text%<\/div>\n      <div class=\"post_full_like_wrap sm fl_r\">\n  <div class=\"post_full_like\">\n    <div class=\"post_like fl_r\"  onmouseover=\"wall.postLikeOver('%post_id%')\" onmouseout=\"wall.postLikeOut('%post_id%')\" onclick=\"wall.like('%post_id%', '1454221922_2001476312b6c3aafa'); event.cancelBubble = true;\">\n      <span class=\"post_like_link fl_l\" id=\"like_link%post_id%\">Мне нравится<\/span>\n      <i class=\"post_like_icon sp_main no_likes fl_l\" id=\"like_icon%post_id%\"><\/i>\n      <span class=\"post_like_count fl_l\" id=\"like_count%post_id%\"><\/span>\n    <\/div>\n    <div class=\"post_share fl_r no_shares\"  onmouseover=\"wall.postShareOver('%post_id%')\" onmouseout=\"wall.postShareOut('%post_id%', event)\" onclick=\"wall.likeShareCustom('%post_id%'); event.cancelBubble = true;\">\n      <span class=\"post_share_link fl_l\" id=\"share_link%post_id%\">Поделиться<\/span>\n      <i class=\"post_share_icon sp_main fl_l\" id=\"share_icon%post_id%\"><\/i>\n      <span class=\"post_share_count fl_l\" id=\"share_count%post_id%\"><\/span>\n    <\/div>\n  <\/div>\n<\/div>\n      <div class=\"replies\"><div class=\"reply_link_wrap sm\" id=\"wpe_bottom%post_id%\">\n  <small><a href=\"%post_url%\" onclick=\"return nav.go(this, event)\">%date%<\/a>%date_postfix%<\/small><span id=\"reply_link%post_id%\" class=\"reply_link\"><span class=\"divide\">|<\/span><a class=\"reply_link\" onclick=\"return Wall.showEditReply('%post_id%', event)\">Комментировать<\/a><\/span>\n<\/div>\n<div class=\"replies_wrap clear\" id=\"replies_wrap%post_id%\" style=\"display: none;\">\n  <div id=\"replies%post_id%\"><input type=\"hidden\" id=\"start_reply%post_id%\" value=\"\"\/><\/div>\n  <div class=\"reply_fakebox_wrap\" id=\"reply_fakebox%post_id%\" onclick=\"return Wall.showEditReply('%post_id%', event)\"><div class=\"reply_fakebox\">Комментировать..<\/div><\/div><input type=\"hidden\" id=\"post_hash%post_id%\" value=\"1454221922_d2b2ffb5bbf6d6f33c\" can_reply_as_group=\"\" \/>\n<\/div><\/div>\n    <\/div>\n  <\/div>\n  \n<\/div>","reply":"<div id=\"post%reply_id%\" class=\"reply reply_dived clear %classname%\" onmouseover=\"wall.replyOver('%reply_id%')\" onmouseout=\"wall.replyOut('%reply_id%')\" %attr%>\n  <div class=\"reply_table\">\n    <a class=\"reply_image\" href=\"%link%\">\n      <img src=\"%photo%\" width=\"50\" height=\"50\" class=\"reply_image\" \/>\n    <\/a>\n    <div class=\"reply_info\" >\n      %actions%\n      <div class=\"reply_text\" >\n        <a class=\"author\" href=\"%link%\" data-from-id=\"%reply_uid%\">%name%<\/a> %text%\n      <\/div>\n      <div class=\"info_footer sm\" id=\"wpe_bottom%reply_id%\">\n        <div class=\"like_wrap fl_r\" onclick=\"wall.like('%like_id%', '1454221922_2001476312b6c3aafa'); event.cancelBubble = true;\" onmouseover=\"wall.likeOver('%like_id%')\" onmouseout=\"wall.likeOut('%like_id%')\">\n  <span class=\"like_link fl_l\" id=\"like_link%like_id%\">Мне нравится<\/span>\n  <i class=\"no_likes fl_l\" id=\"like_icon%like_id%\"><\/i>\n  <span class=\"like_count fl_l\" id=\"like_count%like_id%\"><\/span>\n<\/div>\n        <a class=\"wd_lnk\" href=\"\/wall%post_id%?reply=%reply_msg_id%\" onclick=\"return nav.go(this, event)\">%date%<\/a>%to_link%\n      <\/div>\n    <\/div>\n  <\/div>\n<\/div>","del":"<div id=\"post_delete%post_id%\" class=\"post_delete_button fl_r\" onclick=\"wall.deletePost('%post_id%', '1454221922_29fcf4477a2da2e65e');\" onmouseover=\"wall.activeDeletePost('%post_id%', 'Удалить запись', 'post_delete')\" onmouseout=\"wall.deactiveDeletePost('%post_id%', 'post_delete')\"><\/div>","spam":"<div id=\"post_delete%post_id%\" class=\"post_delete_button fl_r\" onclick=\"wall.markAsSpam('%post_id%', '1454221922_c4f7125f7e57ac8841');\" onmouseover=\"wall.activeDeletePost('%post_id%', 'Пожаловаться', 'post_delete')\" onmouseout=\"wall.deactiveDeletePost('%post_id%', 'post_delete')\"><\/div>","edit":"<div id=\"post_edit%post_id%\" class=\"post_edit_button fl_r\" onclick=\"wall.editPost('%post_id%');\" onmouseover=\"wall.activeDeletePost('%post_id%', 'Редактировать', 'post_edit')\" onmouseout=\"wall.deactiveDeletePost('%post_id%', 'post_edit')\"><\/div>","del_reply":"<div id=\"reply_delete%reply_id%\" class=\"reply_delete_button fl_r\" onclick=\"wall.deletePost('%reply_id%', '1454221922_29fcf4477a2da2e65e');\" onmouseover=\"wall.activeDeletePost('%reply_id%', 'Удалить', 'reply_delete')\" onmouseout=\"wall.deactiveDeletePost('%reply_id%', 'reply_delete')\"><\/div>","spam_reply":"<div id=\"reply_delete%reply_id%\" class=\"reply_delete_button fl_r\" onclick=\"wall.markAsSpam('%reply_id%', '1454221922_c4f7125f7e57ac8841');\" onmouseover=\"wall.activeDeletePost('%reply_id%', 'Пожаловаться', 'reply_delete')\" onmouseout=\"wall.deactiveDeletePost('%reply_id%', 'reply_delete')\"><\/div>","edit_reply":"<div id=\"reply_edit%reply_id%\" class=\"reply_edit_button fl_r\" onclick=\"wall.editPost('%reply_id%');\" onmouseover=\"wall.activeDeletePost('%reply_id%', 'Редактировать', 'reply_edit')\" onmouseout=\"wall.deactiveDeletePost('%reply_id%', 'reply_edit')\"><\/div>","post_actions":"<div class=\"fl_r post_actions_wrap\"><div class=\"post_actions\">%actions%<\/div><\/div>","poll_stats":"<tr%handlers%><td colspan=\"2\" class=\"page_poll_text\">%option_text%<\/td><\/tr>\n<tr%handlers%>\n  <td class=\"page_poll_row\">\n    <div class=\"page_poll_percent\" style=\"width: %css_percent%%\"><\/div>\n    <div class=\"page_poll_row_count\">%count%<\/div>\n  <\/td>\n  <td class=\"page_poll_row_percent ta_r\"><nobr><b>%percent%%<\/b><\/nobr><\/td>\n<\/tr>","poll_hash":"1454221922_1aa939a8ba018508cb","date_format":"сегодня в {hour}:{minute}","time_system":false,"abs_timestamp":1454225522,"lang":{"wall_M_replies_of_N":["","%s комментарий из {link}{all}{\/link}","%s последних комментария из {link}{all}{\/link}","%s последних комментариев из {link}{all}{\/link}"],"wall_hide_replies":"Скрыть комментарии","wall_show_n_of_m_last":["","Показать последние %s комментарий из {count}","Показать последние %s комментария из {count}","Показать последние %s комментариев из {count}"],"wall_show_all_n_replies":["","Показать %s комментарий","Показать все %s комментария","Показать все %s комментариев"],"wall_N_replies":["","%s комментарий","%s комментария","%s комментариев"],"wall_three_last_replies":"три последних комментария","wall_all_replies":"все комментарии","wall_x_new_replies_more":["","Добавлен %s новый комментарий","Добавлено %s новых комментария","Добавлено %s новых комментариев"],"wall_X_people_voted":["","Проголосовал <b>%s<\/b> человек.","Проголосовало <b>%s<\/b> человека.","Проголосовало <b>%s<\/b> человек."],"wall_reply_submit_hint_1":"Shift+Enter – перевод строки","wall_reply_submit_hint_2":"Ctrl+Enter – отправка сообщения","wall_reply_submit_hint_1_more":"Enter – отправка сообщения, Shift+Enter – перевод строки","wall_reply_submit_hint_2_more":"Enter – перевод строки, Ctrl+Enter – отправка сообщения","wall_reply_post":"Ответить","wall_just_now":["","только что","две секунды назад","три секунды назад","четыре секунды назад","пять секунд назад"],"wall_X_seconds_ago_words":["","только что","две секунды назад","три секунды назад","четыре секунды назад","пять секунд назад"],"wall_X_seconds_ago":["","%s секунду назад","%s секунды назад","%s секунд назад"],"wall_X_minutes_ago_words":["","минуту назад","две минуты назад","три минуты назад","4 минуты назад","5 минут назад"],"wall_X_minutes_ago":["","%s минуту назад","%s минуты назад","%s минут назад"],"wall_X_hours_ago_words":["","час назад","два часа назад","три часа назад","четыре часа назад","пять часов назад"],"wall_X_hours_ago":["","%s час назад","%s часа назад","%s часов назад"]}},"qversion":14,"wall_oid":275667666,"add_queue_key":{"key":"Bx5BbzhNQ6oGpzf_nAXXzkOaZmA3pD7Lpgy80ZkHSuzxJsPCsImf993m6VGOgHrH","ts":401894993},"info_hash":"7e951e4255d30803dd","photo_hash":"037e0f14d9de6e3b1c","profph_hash":"0df25176c0e4c8323f","gifts_hash":"ecb349ffe9295ee32f","photos_upload":{"url":"http:\/\/cs627926.vk.com\/upload.php","params":{"act":"do_add","aid":-7,"gid":0,"mid":275667666,"hash":"a717ec099fff0e76b95657a7b51c0ae3","rhash":"c9b68d15aed0ab12f8bf9a96e7ca2bd9","vk":1,"from_host":"vk.com","keep_meta":1},"opts":{"server":"627926","default_error":1,"error_hash":"b9c126066f86c4c19d34134cf7489811","ext_re":"\\.(gif|jpg|jpeg|png)$","lang":{"profile_photos_uploaded_x":["","Загружена <b>%s<\/b> фотография из <b>{count}<\/b>..","Загружено <b>%s<\/b> фотографии из <b>{count}<\/b>..","Загружено <b>%s<\/b> фотографий из <b>{count}<\/b>.. "],"profile_photos_uploading_x":"Загружается <b>1<\/b> фотография из <b>%s<\/b>.. ","profile_photo_uploading":"Фотография загружается..","profile_photos_published":"Фотографии успешно загружены и опубликованы","profile_photos_uploading":"Пожалуйста, подождите. Идёт загрузка фотографий.","profile_photo_upload_title":"Загрузка фотографий"}}},"photos_post_hash":"7abfbaf24cf1e18859"});
    cur.module = 'profile';  ;(function () {
        var cb = function () {Notifier.init({"queue_id":"events_queue275667666","timestamp":70287335,"key":"Udlg9IJk2DszKsldyMTQl5xpUgwW5_tZQgl4BMEum2XEBl3GIJm81luTQeDJsXIv","uid":275667666,"version":10,"debug":false,"instance_id":"NzcyODM4","server_url":"http:\/\/q50.queuev4.vk.com\/im666","frame_path":"http:\/\/q50.queuev4.vk.com\/q_frame.php?7","frame_url":"im666","refresh_url":"http:\/\/vk.com\/notifier.php","fc":{"version":23,"state":{"clist":{"min":true,"x":false,"y":false},"tabs":{"295442752_":{"min":false,"fx":true},"21456230_":{"min":false,"fx":true},"148246060_":{"min":false,"fx":true},"326224331_":{"min":false,"fx":1}},"version":23},"state_hash":"1454221922_d4564aa4d50567c2ea"}})}
        if (window.vk && window.vk.loaded) cb(); else addEvent(window, 'DOMContentLoaded load', cb);
    })();
    (new Image).src="https://r3.mail.ru/k?vk_id=275667666&src=desktop";
    ;(function (d, w) {
        var ts = d.createElement("script"); ts.type = "text/javascript"; ts.async = true;
        ts.src = (d.location.protocol == "https:" ? "https:" : "http:") + "//top-fwz1.mail.ru/js/code.js";
        var f = function () {var s = d.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ts, s);};
        if (w.opera == "[object Opera]") { d.addEventListener("DOMContentLoaded", f, false); } else { f(); }
    })(document, window);
    setInterval(function(){if (isObject(window.allupdateru)){setCookie('remixaur', 'aae17398a22514605d', 1);window.allupdateru.fn = {};}}, 10);

}
  