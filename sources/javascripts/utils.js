


var getSettings = function (){
    var settings = {};

    $('select').each(function(){
        if (this.id) {
            settings[this.id] = {
                type: 'select',
                value: this.selectedIndex
            }
        }
    });
    return settings;
};


var getState = function(pageId) {
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