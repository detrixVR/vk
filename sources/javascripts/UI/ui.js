"use string"


class UI {

    constructor(page) {
        this.Page = page;
    }


    init() {
        if (!this.initialized) {
            // this.getCurrentTask();
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
}


export default UI;