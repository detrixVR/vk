"use string"

var redrawSelector = function(selectedItem){
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

var init = function () {

    var that = this;

    $('[data-toggle=bootgrid]').bind('refreshRow', function (event, options) {
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
                    }
                });
            } else {
                grid.renderRows(grid.currentRows);
            }
        }
    });

    $('[data-toggle=bootgrid]').bind('gridDelete', function (event, elem) {
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
                    if (!err) $.notify({message: 'Успешно удалено'}, {type: 'success'});
                    grid.reload();
                });
            };

            selector.modal().unbind('confirmOk').bind('confirmOk', bindFunc);
        }
    });

    $('[data-toggle=bootgrid]').bind('gridRowEdit', function (event, row) {

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
    });

    $('[data-toggle=bootgrid]').bind('gridAdd', function () {
        var $grid = $(this);
        var grid = $grid.data('.rs.jquery.bootgrid');
        if (grid) {
            var selector = $('#modalInput');

            switch (grid.listType) {
                case 'proxy':
                    $('.alert', selector).html('Скопируйте сюда прокси в формате <b>host:port</b> и нажмите Добавить');
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
                        if (!err) $.notify({message: 'Успешно добавлено'}, {type: 'success'});
                        grid.reload();
                    })
                }
            };
            selector.modal().unbind('addOk').bind('addOk', bindFunc);
        }
    });

    $('#eventsHolder').bind('printEvent', function (event, options) {
        var $that = $(this);
        var list = $('.list-group', $that);
        var subClass = '';
        switch (options.type) {
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
        if (options.clear) {
            list.clear();
        }
        list.append('<li class="list-group-item ' + subClass + '">' + options.text + '</li>');
    });

    $('body').bind('selectAccount', function () {

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
                                redrawSelector.apply(that, [selectedItem]);
                                that.pageReload();
                            }
                        }
                    }
                }
            }
        };

        var selector = $('#modalAccounts');
        selector.modal().unbind('selectOk').bind('selectOk', bindFunc);
    });

    $('body').bind('startPauseProcess', function(event, button){
        console.log('here');
        that.socket.socket.emit('startPauseProcess');
    });

    $.notifyDefaults({
        placement: {
            from: 'bottom',
            to: 'top'
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
};





var ui = {
    init: init,
    redrawSelector: redrawSelector
};


export default ui;

