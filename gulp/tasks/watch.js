/**
 * Created by bogdanov on 10.09.2015.
 */

'use strict';

import gulp from 'gulp';
import browserSync from 'browser-sync';

gulp.task('watch', () => {
    browserSync.init({
        proxy: 'http://127.0.0.1:3000',
//        server: './'
    });
    gulp.watch(['./sources/yavascripts/**/*.js', './sources/stylesheets/**/*.less'], ['default', browserSync.reload]);
});