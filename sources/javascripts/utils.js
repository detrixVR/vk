function getGridSettings(grid) {

    var settings = {};

    if (grid) {
        settings['current'] = grid.current;
        settings['selectedRows'] = grid.selectedRows;
        settings['searchPhrase'] = grid.searchPhrase;
        settings['rowCount'] = grid.getRowCount();
    }

    return settings;
}

function applyGridSettings(id, settings) {

    var $grid = $("#" + id);

    if (!$grid.length || !$grid.data('.rs.jquery.bootgrid')) {
        return (0);
    }

    var grid = $grid.data('.rs.jquery.bootgrid');


    grid.setSelectedRows(settings['selectedRows']);


    grid.setCurrent(settings['current']);
    grid.setSearchPhrase(settings['searchPhrase']);
    grid.setRowCount(settings['rowCount']);

    grid.reload();

}


var getSettings = function () {

    var settings = {};

    $('select').each(function () {
        if (this.id) {
            settings[this.id] = {
                type: 'select',
                value: this.selectedIndex
            }
        }
    });

    $('[data-toggle=bootgrid]').each(function (i, item) {
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

    return settings;
};

var setSettings = function (settings) {


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
                case 'grid':
                    elem = document.getElementById(k);
                    if (elem) {
                        applyGridSettings(k, settings[k].value);
                    }
                    break;
            }

        }
    }
};


var getState = function (pageId) {
    var state = {
        pageId: pageId,
        settings: getSettings()
    };
    return state;
};


var utils = {
    getState: getState,
    getSettings: getSettings
};

export default utils;