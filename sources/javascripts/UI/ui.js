"use string"


class UI {

    constructor(page) {
        this.Page = page;


    }


    init() {
        let that = this;

        this.leftMenu = {elem: $('.left-menu'), timeout: null};
        this.rightMenu = {elem: $('.right-menu'), timeout: null};

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

    _hideMenu(menu) {
        menu.elem.off('focusout').off('focusin');
        menu.elem.data('visible', false).attr('data-visible', false);

    }

    _getElemData(elem) {
        return $(elem).data();
    }

    _loadMenuContent() {

    }

    toggleMenu(elem) {
        var that = this;
        var elemData = this._getElemData(elem);
        if (elemData) {
            let menu = null;
            switch (elemData.side) {
                case 'left':
                    menu = this.leftMenu;
                    break;
                case 'right':
                    menu = this.rightMenu;
                    break;
            }
            let visible = !menu.elem.data('visible');
            clearTimeout(menu.timeout);
            if (visible && !menu.progress) {
                menu.elem.on('focusout', function (e) {
                    menu.timeout = setTimeout(function () {
                        that._hideMenu(menu);
                    }, 1);
                });
                menu.elem.on('focusin', function (e) {
                    clearTimeout(menu.timeout);
                });
                menu.elem.find('input').focus();
                let $list = menu.elem.find('.list');
                if (!$list.data('jsp'))
                    menu.elem.find('.list').jScrollPane();
                let $pane = menu.elem.find('.jspPane');
                menu.elem.data('visible', true).attr('data-visible', true);
                menu.progress = true;
                let menuBody = menu.elem.find('.menu-body');
                let menuToolbar = menu.elem.find('.menu-toolbar');
                menuToolbar.find('input').val('');
                that.Page.UI.progress(menuBody, menu.progress);
                that.Page.requester.accounts.get(null, function (err, data) {
                    $pane.html(_.template($('#accountListRowTemplate').html())({data: data}));
                    menu.progress = false;
                    that.Page.UI.progress(menuBody, menu.progress);
                    $list.data('jsp').reinitialise();
                })
            } else {
                that._hideMenu(menu);
            }
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

    menuSearch(elem) {
        var that = this;
        var elemData = this._getElemData(elem);
        if (elemData) {
            let $elem = $(elem);
            let $input = $elem.closest('.input-group').find('input');
            let $list = $elem.closest('.menu-content').find('.list');
            if ($input.length) {
                let searchText = $input.val();
                let listItems = $('.list-elem', $list);
                listItems.each(function (i, item) {
                    let $item = $(item);
                    let textContent = $item.text().toLowerCase();
                    $item.toggleClass('hidden', !~textContent.indexOf(searchText.toLowerCase()));
                });
            }
        }
    }

    selectMenuListItem(elem) {
        var that = this;
        var elemData = this._getElemData(elem);
        if (elemData) {
            let $elem = $(elem);
            let $list = $elem.closest('.list');
            $('.list-elem', $list).toggleClass('selected', false);
            $elem.toggleClass('selected', true);

        }
    }

    getMenuListItem(elem) {
        var that = this;
        var elemData = this._getElemData(elem);
        if (elemData) {
            that.Page.requester.accounts.get({id: elemData.id}, function (err, data) {
                console.log(data);
            })
        }
    }

    getStatistic() {
        this.Page.Socket.socket.emit('getStatistic');
    }

    setStatistic(data) {
        $('#memoryUsageHolder').html(_.template($('#memoryUsageTemplate').html())({data: data}));
    }
}


export default UI;