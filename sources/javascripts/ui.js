"use string"

import {_} from 'underscore';

var redrawSelector = function (selectedItem) {
    var url = 'url(' + selectedItem.photo_50 + ')';
    var selector = $('#accountHolder');
    var avatarHolder = selector.find('.avatarHolder');
    if (avatarHolder.css('backgroundImage') !== url) {
        avatarHolder.css('backgroundImage', url);
    }
    var accountInfo = $('.accountInfo', selector);
    $('.fio', accountInfo).text(selectedItem.last_name + ' ' + selectedItem.first_name);
    $('.id', accountInfo).text(this.accountId);
    $('a', accountInfo).attr('href', '/config?account=' + this.accountId);
    var nextAccount = $('.nextAccount', selector);
    $('a', nextAccount).attr('href', '/?account=' + this.accountId + '&next=true');
};

var setState = function (data) {
    $('.widget').trigger('setState', [data]);
    $('button, input, a.btn').not('.startPauseButton, .stopButton').attr('disabled', data.state !== 0);
};

var setTaskState = function (data) {
    $('.widget').trigger('setTaskState', [data]);
};

var overlay = function (state) {
    var $overlay = $('.overlay');
    if (state) {
        $('.textHolder', $overlay).text(state);
        $overlay.toggleClass('hidden', false);
    } else {
        $overlay.toggleClass('hidden', true);
    }
};

var setProgress = function (progress) {
    $('.progress-bar#' + progress.id, '.preview-holder').css('width', progress.value + '%').attr('aria-valuenow', progress.value);
};

var getSettings = function () {

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

    settings['accountInfo'] = {
        type: 'accountInfo',
        value: this.accountInfo
    };

    return settings;
};

var applySettings = function (settings) {

    /*function applyGridSettings(id, settings) {

     var $grid = $("#" + id);

     if (!$grid.length || !$grid.data('.rs.jquery.bootgrid')) {
     return (0);
     }

     var grid = $grid.data('.rs.jquery.bootgrid');

     if (grid) {
     // console.log('here')
     grid.setSelectedRows(settings['selectedRows']);
     grid.setCurrent(settings['current']);
     grid.setSearchPhrase(settings['searchPhrase']);
     grid.setRowCount(settings['rowCount']);
     grid.setSortDictionary(settings['sortDictionary']);

     // grid.reload();
     }
     }*/

    for (var k in settings) {
        if (settings.hasOwnProperty(k)) {

            switch (settings[k].type) {
                case 'select':
                    var elem = document.getElementById(k);
                    if (elem) {
                        elem.selectedIndex = settings[k].value;
                        var sp = $(elem).data('selectpicker');
                        if (sp)
                            sp.refresh();
                    }
                    break;
                case 'checkbox':
                    elem = document.getElementById(k);
                    if (elem) {
                        elem.checked = settings[k].value;
                    }
                    break;
                case 'input':
                    elem = document.getElementById(k);
                    if (elem) {
                        elem.value = settings[k].value;
                    }
                    break;
                case 'typeahead':
                    elem = document.getElementById(k);
                    var $elem = $(elem);
                    $elem.focus();
                    var tah = $elem.data('typeahead');
                    if (tah && settings[k].value && settings[k].value.id) {
                        tah.$element.data('value', settings[k].value);
                        tah.$element.data('active', settings[k].value.id);
                        tah.$element.val(settings[k].value.title);
                    }
                    break;
                case 'grid':
                    elem = document.getElementById(k);
                    if (elem) {
                        $('[data-toggle=bootgrid]').trigger('applyGridSettings', [k, settings[k].value]);
                    }
                    break;
            }

        }
    }
};

var setProcess = function (process) {

    if (process) {
        if (process.state)
            setState(process);
        applySettings(process.settings);

    }

    $('.widget').trigger('printEvent', [process ? process.messages : [], true]);

    overlay('Загрузка данных');

    afterInit();

    $('[data-toggle=bootgrid]').trigger('applyAccount').trigger('reload', function () {
        setTimeout(overlay, 100)
    });
};

var printEvent = function (data) {
    $('.widget').trigger('printEvent', [data, data.clear]);
};

var refreshRow = function (data) {
    $('[data-toggle=bootgrid]').trigger('refreshRow', data);
};

var reloadGrid = function (data) {
    console.log(data);
    $('[data-toggle=bootgrid]#' + data.gridId).trigger('reloadGrid');
};

var highLightFunc = function () {
    $(this).closest('.form-group').toggleClass('has-error', false);
};

var highLightFields = function (badFields) {

    badFields.forEach(function (item) {
        var $field = $('#' + item);
        $field.closest('.form-group').toggleClass('has-error', true);
        $field.off('change', highLightFunc).on('change', highLightFunc);
    })
};

var renderAccountHolder = function (account) {
    console.log(account);
    $('#accountHolder').html(_.template($('#accountHolderTemplate').html())(account.accountInfo));

    $('#accountHolder').trigger('account', account.accountInfo);


};

var setProcesses = function (processes) {
    if (processes.length) {
        processes.forEach(function (item, i) {
            $('.widget').trigger('printProcess', [item, i === 0]);
        });


    } else {
        $('.widget').trigger('printNoProcesses');
    }

};

var displayNotification = function (info) {

    var type = 'info';

    switch (info.type) {
        case 2:
            type = 'warning';
            break;
        case 3:
            type = 'success';
            break;
        case 4:
            type = 'danger';
            break;
    }

    $.notify({message: info.notify}, {type: type});
};

var getTitleById = function (processId) {
    var title = null;
    switch (processId) {
        case 'validateProxy':
            title = 'Валидация прокси';
            break;
        default :
            title = 'Стандартное название';
    }
    return title;
};

var getListGroupItemClass = function (type) {
    var subClass = '';
    switch (type) {
        case 0: // info
            subClass = 'list-group-item-info';
            break;
        case 1: //warning
            subClass = 'list-group-item-warning';
            break;
        case 2: //success
            subClass = 'list-group-item-success';
            break;
        case 3: //danger
            subClass = 'list-group-item-danger';
            break;
    }
    return subClass;
};

var setProcessButtonsState = function (state, parent) {


    if (parent.hasClass('eventsHolder') || parent.hasClass('taskHolder')) {

        var stopButton = $('.stopButton', parent);
        var startPauseButton = $('.startPauseButton', parent);

        stopButton.attr('disabled', false);
        startPauseButton.attr('disabled', false);

        if (parent.hasClass('taskHolder') && state === 0) {
            startPauseButton.toggleClass('hidden', true);
            parent.find('.finishIndicator').toggleClass('hidden', false);
        } else {
            startPauseButton.find('.glyphicon').
                toggleClass(state === 1 ? 'glyphicon-play' : 'glyphicon-pause', false).
                toggleClass(state === 2 || state === 0 ? 'glyphicon-play' : 'glyphicon-pause', true);
        }


        stopButton.toggleClass('hidden', state === 0);
    }

};

var setTaskButtonsState = function (data, parent) {

    if (parent.hasClass('taskHolder')) {

        var elemData = parent.data();
        if (elemData.task === data.uid) {
            var stopButton = $('.stopButton', parent);
            var startPauseButton = $('.startPauseButton', parent);

            stopButton.attr('disabled', false);
            startPauseButton.attr('disabled', false);

            if (parent.hasClass('taskHolder') && data.state === 0) {
                startPauseButton.toggleClass('hidden', true);
                parent.find('.finishIndicator').toggleClass('hidden', false);
            } else {
                startPauseButton.find('.glyphicon').
                    toggleClass(data.state === 1 ? 'glyphicon-play' : 'glyphicon-pause', false).
                    toggleClass(data.state === 2 || data.state === 0 ? 'glyphicon-play' : 'glyphicon-pause', true);
            }


            stopButton.toggleClass('hidden', data.state === 0);
        }


    }

};

var printTasks = function (data) {
    console.log(data);
    data.tasks.forEach(function (item) {
        createTask(item);
    })
};

var createTask = function (task) {
    $('.widget').trigger('printTask', task);
};


var init = function () {

    var that = this;

    var isArray = function (someVar) {
        return Object.prototype.toString.call(someVar) === '[object Array]';
    };

    $('[data-toggle=bootgrid]')
        .bind('refreshRow', function (event, options) {
            var $grid = $(this);
            var grid = $grid.data('.rs.jquery.bootgrid');
            var findedItem = grid.currentRows.find(function (item) {
                return item._id === options.id
            });
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
        .bind('gridRefreshItem', function(event, elem){
            var $elem = $(elem);
            var rowId = $elem.data('row-_id');
            var $grid = $(this);
            var grid = $grid.data('.rs.jquery.bootgrid');
            if (grid) {
                var content = 'Обновить запись?';
                var selector = $('#modalConfirm');
                $('.modal-body', selector).html(content);

                var bindFunc = function () {
                    console.log(rowId)
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


    $(document)
        .bind('startPauseProcess', '.widget', function (event, data) {
            var $target = $(event.target);
            if ($target.hasClass('taskHolder')) {
                var $elem = $(data);
                $elem.attr('disabled', true);
                var elemData = $target.data();
                that.socket.socket.emit('startPauseProcess', {
                    processId: elemData.process
                });
            } else if ($target.hasClass('eventsHolder')) {
                $('.startPauseButton', $target).attr('disabled', true);
                that.socket.socket.emit('startPauseProcess', {
                    processId: data,
                    settings: getSettings.call(that)
                });
            }
        })
        .bind('stopProcess', '.widget', function (event, elem) {
            var $elem = $(elem);
            var $target = $(event.target);
            $elem.attr('disabled', true);
            if ($target.hasClass('taskHolder')) {
                var data = $target.data();
                that.socket.socket.emit('stopProcess', {
                    processId: data.process
                });
            } else if ($target.hasClass('eventsHolder')) {
                that.socket.socket.emit('stopProcess', {
                    processId: that.processId
                });
            }
        })
        .bind('printEvent', '.widget', function (event, message, clear) {
            var $target = $(event.target);
            if ($target.hasClass('taskHolder')) {
                var inner = $target.find('.innerText');
                var jsp = inner.data('jsp');
                var textList = $('ul', inner);
                textList.prepend('<li><span class="small"><span class="time">' + new Date(message.time).toLocaleString() + '</span> ' + message.msg + '</span></li>').fadeIn();
                var elements = $('li', textList);
                var length = elements.length;
                if (length > 20) {
                    elements.last().remove();
                } else {
                    if (jsp) {
                        jsp.reinitialise();
                    }
                }
                $target.closest('.list-group-item').toggleClass(getListGroupItemClass(message.type), true);
            } else if ($target.hasClass('eventsHolder')) {
                var listHolder = $('.listHolder', $target);
                var list = $('.list-group', listHolder);
                if (!isArray(message)) {
                    message = [message];
                }
                if (clear) {
                    list.empty();
                }
                message.forEach(function (item) {
                    list.prepend('<li class="list-group-item ' + getListGroupItemClass(item.type) + '"><span class="text-muted small">' + new Date(item.time).toLocaleString() + '</span> ' + item.msg + '</li>');
                });
                jsp = listHolder.data('jsp');
                if (jsp) {
                    jsp.reinitialise();
                } else {
                    listHolder.jScrollPane();
                }
            }
        })
        .bind('setState', '.widget', function (event, data) {
            setProcessButtonsState(data.state, $(event.target));
        })
        .bind('setTaskState', '.widget', function (event, data) {
            setTaskButtonsState(data, $(event.target));
        })
        .bind('printProcess', '.widget', function (event, process, clear) {

            var $target = $(event.target);

            if ($target.hasClass('tasksHolder')) {
                var tabContainer = $('#tab1 .row', $target);

                if (clear) {
                    tabContainer.empty();
                }

                var lastMsg = task.messages.pop();

                tabContainer.append(_.template($('#taskRow').html())({
                    listGroupStyle: getListGroupItemClass(lastMsg ? lastMsg.type : 0),
                    accountId: process.accountId,
                    processId: process.processId,
                    processTitle: getTitleById(process.processId),
                    avatarUrl: process.settings.accountInfo.value.photo_50,
                    lastMessageTime: new Date(lastMsg.time).toLocaleString(),
                    lastMessage: lastMsg.msg,
                    startPauseButtonGlyph: (process.state === 2 ? 'glyphicon-play' : 'glyphicon-pause')
                }));


            }
        })
        .bind('printNoProcesses', '.widget', function (event) {
            var $target = $(event.target);
            if ($target.hasClass('tasksHolder')) {
                $('#tab1', $target).html(_.template($('#noProcessesTemplate').html())({}))
            }
        })
        .bind('createTask', '.widget', function () {
            that.socket.socket.emit('createTask', {
                settings: getSettings.call(that)
            });
        })
        .bind('printTask', '.widget', function (event, task, clear) {

            var $target = $(event.target);

            if ($target.hasClass('tasksHolder')) {

                var tabContainer = $('#tab1 .row', $target);

                if (clear) {
                    tabContainer.empty();
                }

                var lastMsg = task.messages.pop();

                tabContainer.prepend(_.template($('#taskRowTemplate').html())({
                    listGroupStyle: getListGroupItemClass(lastMsg ? lastMsg.type : 0),
                    accountId: task.accountId,
                    taskUid: task.uid,
                    processTitle: getTitleById(task.uid) || task.settings.taskName.value,
                    avatarUrl: task.settings.accountInfo.value.photo_50,
                    lastMessageTime: lastMsg ? new Date(lastMsg.time).toLocaleString() : null,
                    lastMessage: lastMsg ? lastMsg.msg : null,
                    startPauseButtonGlyph: (task.state === 2 || task.state === 0 ? 'glyphicon-play' : 'glyphicon-pause'),
                    taskState: task.state
                }));


            }
        })
        .bind('startPauseTask', '.widget', function (event, data) {
            var $target = $(event.target);
            if ($target.hasClass('taskHolder')) {
                var $elem = $(data);
                $elem.attr('disabled', true);
                var elemData = $target.data();
                that.socket.socket.emit('startPauseTask', {
                    uid: elemData.task
                });
            }
        })
        .bind('stopTask', '.widget', function (event, data) {
            var $target = $(event.target);
            if ($target.hasClass('taskHolder')) {
                var $elem = $(data);
                $elem.attr('disabled', true);
                var elemData = $target.data();
                that.socket.socket.emit('stopTask', {
                    uid: elemData.task
                });
            }
        })
        .bind('showProcessInfo', '.widget', function (event, rowData) {
            var $target = $(event.target);
            if ($target.hasClass('freezedEventsHolder')) {
                rowData.getListGroupItemClass = getListGroupItemClass;
                $('.list-group', $target).html(_.template($('#eventsList').html())(rowData));
            }
        });


    $(document.body)
        .bind('selectAccount', function () {

            var bindFunc = function () {
                var $this = $(this);
                var $grid = $this.find('[data-toggle=bootgrid]');
                if ($grid.length) {
                    var grid = $grid.data('.rs.jquery.bootgrid');
                    if (grid) {
                        var selectedItemId = grid.selectedRows.length ? grid.selectedRows[0] : null;
                        if (selectedItemId) {
                            var selectedItem = grid.currentRows.find(function (item) {
                                return item._id == selectedItemId
                            });
                            if (selectedItem) {
                                if (that.accountId != selectedItem.id) {
                                    that.accountId = selectedItem.id;


                                    that.accountInfo = selectedItem;
                                    redrawSelector.apply(that, [selectedItem]);
                                    that.pageReload(accountId);
                                }
                            }
                        }
                    }
                }
            };

            var selector = $('#modalAccounts');
            selector.modal().unbind('selectOk').bind('selectOk', bindFunc);
        });

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

    $('#accountHolder').popover({
        html: true,
        // trigger: 'click',
        container: '.popoverHolder',
        placement: 'right',
        viewport: '#test',
        trigger: 'manual',
        template: '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>',
        content: $('#accountPopupTemplate').html()//"<div>And here's some amazing content. It's very engaging. Right?<button class='btn btn-default save'></button></div>"
    }).on('shown.bs.popover', function (e) {
        var popup = $(e.target).data('bs.popover');
        if (popup) {
            popup.$tip.off('click').on('click', function (e) {
                if ($(e.target).is('.save')) {
                    popup.hide();
                }
            });
            /* popup.$element.off('click').on('click', function () {
             popup.$element.off('click');
             popup.hide();
             })*/

        }


    }).on('hidden.bs.popover', function (e) {
        var popup = $(e.target).data('bs.popover');
        if (popup) {
            /* popup.$element.off('click').on('click', function () {
             popup.show();
             })*/
        }
    }).on('account', function (event, account) {
        var $this = $(this);
        var popup = $this.data('bs.popover');
        if (popup) {
            //popup.hide();
            // popup.options.content = $('#accountPopupTemplate').html();
            popup.options.content = _.template($('#accountPopupTemplate').html())(account);
            popup.setContent();
        }
    })

};

function afterInit() {

    $('.selectpicker').on('change', function (e) {
        console.log('selectpicker tst chage');
        var selectedIndex = this.selectedIndex;
        var $this = $(this);
        var id = $this.attr('id');
        var selector = $('.' + id + selectedIndex);
        $('[class^=' + id + ']').not(selector).toggleClass('hidden', true);
        selector.toggleClass('hidden', false);
    });

    $('.selectpicker').trigger('change');

    $('[type=checkbox]').on('change', function () {
        var $this = $(this);
        var id = $this.attr('id');
        var selector = $('.' + id + ($this.prop('checked') ? 1 : 0));
        $('[class^=' + id + ']').not(selector).toggleClass('hidden', true);
        selector.toggleClass('hidden');
    });

    $('[type=checkbox]').trigger('change');
}

var ui = {
    init: init,
    redrawSelector: redrawSelector,
    setState: setState,
    setProcess: setProcess,
    overlay: overlay,
    printEvent: printEvent,
    refreshRow: refreshRow,
    reloadGrid: reloadGrid,
    highLightFields: highLightFields,
    displayNotification: displayNotification,
    setProcesses: setProcesses,
    getTitleById: getTitleById,
    renderAccountHolder: renderAccountHolder,
    setProgress: setProgress,
    createTask: createTask,
    setTaskState: setTaskState,
    printTasks: printTasks,
};

export default ui;

