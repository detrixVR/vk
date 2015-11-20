/**
 * Created by bogdanov on 10.09.2015.
 */

'use strict'

export default {
    vendor_files: [
        'bower_components/momentjs/moment.js',
        'bower_components/angular/angular.min.js',
        'bower_components/angular-ui-router/release/angular-ui-router.min.js',
        'bower_components/angular-animate/angular-animate.min.js',
        'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'bower_components/angular-ui-select/dist/select.min.js',
        'bower_components/hamsterjs/hamster.js',
        'bower_components/angular-mousewheel/mousewheel.js',
        'bower_components/signalr/jquery.signalR.min.js',
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/angular-signalr-hub/signalr-hub.min.js',
    ],
    build: {
        baseDir: './public',
        fonts: './public/fonts',
        styles: './public/stylesheets',
        scripts: './public/javascripts',
        images: './public/images'
    }
}