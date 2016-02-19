"use string"


class UI {

    constructor(page) {
        this.Page = page;
    }

    _postInit() {
        $('[data-toggle="tooltip"]').tooltip();
        $('.selectpicker').selectpicker();
        $('[data-toggle=bootgrid]').bootgrid();
        this.initTable();
    }

    initTable() {
        $('[data-toggle=bootgrid]')
            /*.bind('refreshRow', function (event, options) {
             var $grid = $(this);
             var grid = $grid.data('.rs.jquery.bootgrid');
             var findedItem = grid.currentRows.find(function (item) {
             return item._id === options.id
             });

             console.log(options);

             if (findedItem) {
             options.columns.forEach(function (item, i) {
             findedItem[item] = options.values[i];
             });
             if (options.update) {
             grid.append([findedItem], function (err) {
             if (!err) {
             grid.renderRows(grid.currentRows);
             $.notify({message: 'Успешно обновлено'}, {type: 'success'});
             }
             });
             } else {
             grid.renderRows(grid.currentRows);
             }
             }
             })*/
            .bind('refreshRow', function (event, rowData) {
                var $grid = $(this);
                var grid = $grid.data('.rs.jquery.bootgrid');

                var foundedItem = grid.currentRows.find(function (item) {
                    return item._id === rowData._id
                });

                if (foundedItem) {

                    $.extend(foundedItem, rowData);

                    grid.renderRows(grid.currentRows);
                }
            })
            .bind('disableRow', function (event, rowData) {
                var $grid = $(this);
                var grid = $grid.data('.rs.jquery.bootgrid');

                var foundedItem = grid.currentRows.find(function (item) {
                    return item._id === rowData._id
                });

                if (foundedItem) {


                    foundedItem.status = 4;

                    grid.renderRows(grid.currentRows);
                }
            })
            .bind('gridDelete', function (event, elem) {
                var $elem = $(elem);
                var rowId = $elem.data('row-_id');
                var $grid = $(this);
                var grid = $grid.data('.rs.jquery.bootgrid');
                if (grid) {
                    var content = 'Удалить элемент?';
                    if (!rowId) {
                        if (!grid.selectedRows.length) {
                            return (0);
                        }
                        content = 'Удалить выделенные элементы?';
                    }
                    var selector = $('#modalConfirm');
                    $('.modal-body', selector).html(content);

                    var bindFunc = function () {
                        var forRemove = rowId ? [rowId] : grid.selectedRows;
                        grid.remove(forRemove, function (err) {
                            if (!err) {
                                grid.reload(function () {
                                    $.notify({message: 'Успешно удалено'}, {type: 'success'});
                                });
                            } else {
                                $.notify({message: 'Произошла ошибка'}, {type: 'error'});
                            }
                        });
                    };

                    selector.modal().unbind('confirmOk').bind('confirmOk', bindFunc);
                }
            })
            .bind('gridRefreshItem', function (event, elem) {
                var $elem = $(elem);
                var rowId = $elem.data('row-_id');
                var $grid = $(this);
                var grid = $grid.data('.rs.jquery.bootgrid');
                if (grid) {
                    var content = 'Обновить запись?';
                    var selector = $('#modalConfirm');
                    $('.modal-body', selector).html(content);

                    var bindFunc = function () {
                        console.log(rowId);
                        that.socket.socket.emit('startPauseTask', {
                            taskName: 'gridRefreshItem',
                            settings: {
                                listType: {
                                    value: grid.listType
                                },
                                items: {
                                    value: [grid.currentRows.find(function (item) {
                                        return item._id === rowId
                                    })]
                                }
                            }
                        });
                    };

                    selector.modal().unbind('confirmOk').bind('confirmOk', bindFunc);
                }
            })
            .bind('gridRowEdit', function (event, row) {

                var $row = $(row);
                var rowId = $row.data('row-_id');
                var $grid = $(this);
                var grid = $grid.data('.rs.jquery.bootgrid');
                if (rowId && grid) {

                    var bindFunc = function () {
                        var $this = $(this);
                        var inputs = $this.find('.modal-body').find('input');
                        var columns = [];
                        var values = [];
                        inputs.each(function () {
                            var $this = $(this);
                            var columnName = $this.data('column');
                            if (columnName) {
                                columns.push(columnName);
                                values.push($this.val());
                            }
                        });
                        $grid.trigger('refreshRow', {
                            id: rowId,
                            columns: columns,
                            values: values,
                            update: true
                        });
                    };

                    var content = '';
                    var rowData = grid.currentRows.find(function (item) {
                        return item._id === rowId
                    });
                    if (rowData) {
                        for (var k in rowData) {
                            if (rowData.hasOwnProperty(k)) {
                                var column = grid.columns.find(function (item) {
                                    return item.id === k;
                                });
                                if (column && column.editable) {
                                    content += '<div class="form-group"><input class="form-control" data-column="' + k + '" value="' + rowData[k] + '"/></div>';
                                }
                            }
                        }
                        if (content) {
                            var selector = $('#modalEdit');
                            $('.modal-body', selector).html(content);
                            selector.modal().unbind('editOk').bind('editOk', bindFunc);
                        }
                    }
                }
            })
            .bind('gridAdd', function () {
                var $grid = $(this);
                var grid = $grid.data('.rs.jquery.bootgrid');
                if (grid) {
                    var selector = $('#modalInput');
                    var alert = $('.alert', selector);
                    switch (grid.listType) {
                        case 'proxy':
                            alert.html('Скопируйте сюда прокси в формате <b>host:port</b> и нажмите Добавить');
                            break;
                        case 'account':
                            alert.html('Скопируйте сюда аккаунты в формате <b>логин:пароль</b> и нажмите Добавить');
                            break;
                    }

                    var bindFunc = function () {
                        var $this = $(this);
                        var textArea = $('textarea', $this);
                        var linesArr = textArea.val().split('\n').map(function (item) {
                            if (item) {
                                return {
                                    content: item
                                };
                            } else {
                                return false;
                            }
                        }).filter(function (item) {
                            return item.content
                        });

                        if (linesArr.length) {
                            grid.append(linesArr, function (err) {
                                if (!err) {
                                    grid.reload(function () {
                                        $.notify({message: 'Успешно добавлено'}, {type: 'success'});
                                    });
                                } else {
                                    $.notify({message: 'Произошла ошибка'}, {type: 'error'});
                                }

                            })
                        }
                    };
                    selector.modal().unbind('addOk').bind('addOk', bindFunc);
                }
            })
            .bind('reload', function (event, callback) {
                var $grid = $(this);
                var grid = $grid.data('.rs.jquery.bootgrid');
                if (grid) {
                    grid.reload(function () {
                        callback();
                    });
                }
            })
            .bind('eventable', function (event, rowData) {
                console.log('from grid');
                $('.widget').trigger('showProcessInfo', rowData);
            })
            .bind('reloadGrid', function () {
                var $grid = $(this);
                var grid = $grid.data('.rs.jquery.bootgrid');
                grid.reload(function () {
                    //$.notify({message: 'Успешно удалено'}, {type: 'success'});
                });
            })
            .bind('saveList', function (event) {
                console.log('saveList')
            })
            .bind('applyGridSettings', function (event, id, settings) {
                var $grid = $(this);
                if ($grid.attr('id') === id) {
                    var grid = $grid.data('.rs.jquery.bootgrid');
                    if (grid) {
                        grid.setSelectedRows(settings['selectedRows']);
                        grid.setCurrent(settings['current']);
                        grid.setSearchPhrase(settings['searchPhrase']);
                        grid.setRowCount(settings['rowCount']);
                        grid.setSortDictionary(settings['sortDictionary']);
                    }
                }

            })
            .bind('applyAccount', function () {
                var $grid = $(this);
                var grid = $grid.data('.rs.jquery.bootgrid');
                if (grid) {
                    grid.setAccountId(that.accountId);
                }
            });
    }

    init() {
        let that = this;

        _.templateSettings = {
            evaluate: /\{\{(.+?)\}\}/g,
            interpolate: /\{\{=(.+?)\}\}/g,
            escape: /\{\{-(.+?)\}\}/g
        };

        $.notifyDefaults({
            placement: {
                from: 'bottom',
                to: 'top'
            }
        });





        $(document).on('click', '.speechBox', function (event) {
            var currentTarget = $(event.currentTarget);
            var target = $(event.target);
            if (!target.hasClass('jspTrack') && !target.hasClass('jspDragTop') && !target.hasClass('jspDragBottom') && !target.hasClass('jspDrag')) {

                currentTarget.toggleClass('expanded', !currentTarget.hasClass('expanded'));
                var inner = $('.innerText', currentTarget);
                var jsp = inner.data('jsp');
                if (currentTarget.hasClass('expanded')) {
                    if (jsp) {
                        jsp.reinitialise();
                    } else {
                        inner.jScrollPane();
                    }
                } else {
                    if (jsp) {
                        jsp.scrollToY(0);
                        jsp.destroy();
                    }
                }
            }

        });

        $(document).ajaxError(function (e, x, settings, exception) {
            var message;
            var statusErrorMap = {
                '400': "Server understood the request, but request content was invalid",
                '401': "Unauthorized access",
                '403': "Forbidden resource can't be accessed",
                '404': "Not found",
                '500': "Internal server error",
                '503': "Service unavailable"
            };
            if (x.status) {
                if (x.status === 500) {
                    message = 'Ошибка сервера';
                } else if (x.responseJSON) {
                    if (x.responseJSON.errorText || x.responseJSON.msg) {
                        message = x.responseJSON.errorText || x.responseJSON.msg;
                    } else {
                        message = 'ХЗ сообщение';
                    }
                    if (x.responseJSON.captcha) {
                        $('#captchaFormGroup').toggleClass('hidden');
                        $('#captcha').val('');
                    }
                    if (x.responseJSON.fields) {
                        x.responseJSON.fields.forEach(function (item) {
                            $item = $('#' + item);
                            if (!$item.closest('.form-group').hasClass('has-error')) $item.closest('.form-group').addClass('has-error');
                        });
                    }
                } else {
                    message = statusErrorMap[x.status];
                    if (!message) {
                        message = "Unknown Error";
                    }
                }
            } else if (exception == 'parsererror') {
                message = "Parsing JSON Request failed";
            } else if (exception == 'timeout') {
                message = "Request Time out";
            } else if (exception == 'abort') {
                message = "Request was aborted by the server";
            } else {
                message = "Unknown Error";
            }
            $.notify({message: message}, {type: 'warning'});
        });

        $('.selectpicker').selectpicker();

        $('.spinner input').on('keydown', function (e) {
            if (!((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105))) {
                e.preventDefault();
            }
        });

        $('.spinner input').on('change', function (e) {
            if (isNaN(parseInt(this.value))) {
                this.value = 0;
            } else {
                var input = $(this);
                if (input.hasClass('hours') && this.value > 24)
                    this.value = 24;
                else if (input.hasClass('minutes') && this.value > 60)
                    this.value = 60;
                else if (input.hasClass('seconds') && this.value > 60)
                    this.value = 60;
                else if (input.attr('max') && +this.value > +input.attr('max')) {
                    this.value = input.attr('max');
                }
            }
        });

        $('.spinner .btn:first-of-type').on('click', function () {
            var $this = $(this);
            var input = $this.closest('.spinner').find('input:not(:disabled)');
            if (input) {
                var parsedVal = parseInt(input.val(), 10) + 1;
                var val = (parsedVal < 0 || isNaN(parsedVal)) ? 0 : parsedVal;
                if (input.hasClass('hours') && val > 24)
                    return (0);
                else if (input.hasClass('minutes') && val > 60)
                    return (0);
                else if (input.hasClass('seconds') && val > 60)
                    return (0);
                input.val(val);
                input.trigger('change');
            }
        });

        $('.spinner .btn:last-of-type').on('click', function () {
            var $this = $(this);
            var input = $this.closest('.spinner').find('input:not(:disabled)');
            if (input) {
                var parsedVal = parseInt(input.val(), 10) - 1;
                var val = (parsedVal < 0 || isNaN(parsedVal)) ? 0 : parsedVal;
                if (input.hasClass('hours') && val > 24)
                    return (0);
                else if (input.hasClass('minutes') && val > 60)
                    return (0);
                else if (input.hasClass('seconds') && val > 60)
                    return (0);
                input.val(val);
                input.trigger('change');
            }
        });

        $(window).on('resize', function () {
            $('.jspContainer').each(function (i, item) {
                var jsp = $(item).parent().data('jsp');
                if (jsp) {
                    jsp.reinitialise();
                }
            });
        });

        $('[data-toggle="tooltip"]').tooltip();

        if (!this.initialized) {
            var oldJQueryEventTrigger = jQuery.event.trigger;
            jQuery.event.trigger = function (event, data, elem, onlyHandlers) {
                if (elem && elem.id === 'kozelTimur') {
                    eval('that.' + event + '(data)');
                }
                oldJQueryEventTrigger(event, data, elem, onlyHandlers);
            };
            this.initialized = true;
        }
        return this;
    }

    overlay(state) {
        var $overlay = $('.overlay');
        if (state) {
            $('.textHolder', $overlay).text(state);
            $overlay.toggleClass('hidden', false);
        } else {
            $overlay.toggleClass('hidden', true);
        }
    }

    setCurrentTask(task) {
        if (!task) {
            this.overlay();
        }
    }

    progress(elem, bool) {
        var $elem = $(elem);
        if (bool) {
            $elem.css({
                position: 'relative'
            });
            $('<div class="huyax-progress">').appendTo($elem).css({
                width: $elem.outerWidth(),
                height: $elem.outerHeight(),
                position: 'absolute',
                top: 0,
                left: 0
            })
        } else {
            $elem.find('.huyax-progress').remove();
        }
    }

    _getSideMenu($elem) {
        switch ($elem.closest('.menu-content').data('side')) {
            case 'left':
                return this.Page.leftMenu;
            case 'right':
                return this.Page.rightMenu;
        }
    }

    toggleMenu($elem) {
        var elemData = $elem.data();
        switch (elemData.side) {
            case 'left':
                this.Page.leftMenu.toggleMenu();
                break;
            case 'right':
                this.Page.rightMenu.toggleMenu();
                break;
        }
    }

    menuSearch($elem) {
        this._getSideMenu($elem).menuSearch($elem);
    }

    menuSelectListItem($elem) {
        this._getSideMenu($elem).menuSelectListItem($elem);
    }

    menuGetListItem($elem) {
        this._getSideMenu($elem).menuGetListItem($elem);
    }

    menuToggleFilter($elem) {
        this._getSideMenu($elem).menuToggleFilter($elem);
    }

    drawAccountInfo() {
        $('#accountInfoHolder').html(_.template($('#accountInfoTemplate').html())({account: this.Page.account}));
    }

    navigate($elem) {
        let elemData = $elem.data();
        if (!this.Page.account && !elemData.free) {
            alert('Не выбран аккаунт')
        } else {
            let $iframe = $('#iframe');
            let link = elemData.link;
            this.progress($iframe, true);
            $iframe.load('/static?link=' + link, (responseText, textStatus, jqXHR) => {

                if (jqXHR.status !== 200) {
                    console.error('error');
                } else {

                    this.Page.pageId = link;
                  /*  switch (link) {
                        case '':
                            this.Page.pageId = 'mainPage';
                            break;
                        case 'test':
                            this.Page.pageId = 'mainPage';
                            break;
                        case 'admin':
                            this.Page.pageId = 'adminPanel';
                            break;
                        case 'proxies':
                            this.Page.pageId = 'validateProxies';
                            break;
                        case 'accounts':
                            this.Page.pageId = 'validateAccounts';
                            break;
                        case 'peoples':
                            this.Page.pageId = 'searchPeoples';
                            break;
                        case 'groups':
                            this.Page.pageId = 'searchGroups';
                            break;
                        case 'lists':
                            this.Page.pageId = 'listCreatingFromPerson';

                            switch (parsedQUERY.type) {
                                case 'group':
                                    this.Page.pageId = 'listCreatingFromGroup';
                                    break;
                                case 'audio':
                                    this.Page.pageId = 'listCreatingFromAudio';
                                    break;
                                case 'video':
                                    this.Page.pageId = 'listCreatingFromVideo';
                                    break;
                                case 'post':
                                    this.Page.pageId = 'listCreatingFromPost';
                                    break;
                            }
                            break;
                        case 'tasks':
                            this.Page.pageId = 'taskExecution';
                            break;
                        case 'config':

                            this.pageId = 'configurationClean';

                            switch (parsedQUERY.type) {
                                case 'copy':
                                    this.Page.pageId = 'configurationCopy';
                                    break;
                                case 'group':
                                    this.Page.pageId = 'configurationGroup';
                                    break;
                            }
                            break;
                    }
*/
                    this.Page.joinAccountPage();
                }

                this._postInit();
                this.progress($iframe, false);
            });
        }

    }

    getStatistic() {
        this.Page.Socket.socket.emit('getStatistic');
    }

    setStatistic(data) {
        $('#memoryUsageHolder').html(_.template($('#memoryUsageTemplate').html())({data: data}));
    }

    getSettings() {

        function getGridSettings(grid) {

            var settings = {};

            if (grid) {
                settings['current'] = grid.current;
                settings['accountId'] = grid.accountId;
                settings['selectedRows'] = grid.getSelectedRows();
                settings['searchPhrase'] = grid.getSearchPhrase();
                settings['rowCount'] = grid.getRowCount();
                settings['sort'] = grid.getSortDictionary();
            }

            return settings;
        }

        var settings = {};

        $('select').each(function () {
            if (this.id) {
                settings[this.id] = {
                    type: 'select',
                    value: this.selectedIndex
                }
            }
        });

        $('[data-toggle=bootgrid]:visible').each(function (i, item) {
            var $this = $(item);

            if ($this.data('.rs.jquery.bootgrid')) {
                var grid = $this.data('.rs.jquery.bootgrid');
                if (item.id) {
                    settings[item.id] = {
                        type: 'grid',
                        value: getGridSettings(grid)
                    }
                }
            }
        });

        $('[type=checkbox]').each(function (i, item) {
            if (item.id) {
                settings[item.id] = {
                    type: 'checkbox',
                    value: item.checked
                }
            }
        });

        $('[type=text]').each(function (i, item) {
            if (item.id) {
                settings[item.id] = {
                    type: 'input',
                    value: item.value
                }
            }
        });

        $('[type=typeahead]').each(function (i, item) {
            if (item.id) {
                settings[item.id] = {
                    type: 'typeahead',
                    value: $(item).data('value') || 0
                }
            }
        });

        $('[type=datetimepicker]').each(function (i, item) {
            if (item.id) {
                var $parent = $(item).parent();
                var dp = $parent.data('DateTimePicker');
                if (dp) {
                    var date = dp.date();
                    if (date) {
                        var value = date.toDate();
                        value = value.getTime();
                        settings[item.id] = {
                            type: 'datetimepicker',
                            value: value
                        }
                    }
                }
            }
        });

        /*settings['accountInfo'] = {
            type: 'accountInfo',
            value: this.accountInfo
        };*/

        return settings;
    }

    createTask($elem) {
        this.Page.Socket.socket.emit('createTask', {
            settings: this.getSettings(),
            start: $elem.data('start')
        });
    }

    startPauseTask($elem) {
        let uid = $elem.data('uid');
        this.Page.Socket.socket.emit('startPauseTask', $.extend({
            uid: uid,
            pageId: this.Page.pageId
        }, (uid ? {} : {settings: this.getSettings()})));
    }

    stopTask($elem) {
        let uid = $elem.data('uid');
        if (uid) {
            this.Page.Socket.socket.emit('stopTask', {
                uid: $elem.data('uid')
            });
        }
    }
}


export default UI;