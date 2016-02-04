"use string"


class UI {

    constructor(page) {
        this.Page = page;
    }


    init() {
        let that = this;

        _.templateSettings = {
            evaluate:    /\{\{(.+?)\}\}/g,
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
                if (elem.id === 'kozelTimur') {
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

    getStatistic() {
        this.Page.Socket.socket.emit('getStatistic');
    }

    setStatistic(data) {
        $('#memoryUsageHolder').html(_.template($('#memoryUsageTemplate').html())({data: data}));
    }
}


export default UI;