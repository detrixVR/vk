/**
 * Created by bogdanov on 10.09.2015.
 */

'use strict';

import gulp from 'gulp';

import config from '../config.js';
/*
gulp.task('copy', ['eslint'], (ds) => {
    gulp.src(config.vendor_files)
        .pipe(gulp.dest('./public/js/vendor'));

    gulp.src(['bower_components/bootstrap-css-only/css/*.min.css'])
        .pipe(gulp.dest(config.build.styles));
    gulp.src(['bower_components/angular-ui-select/dist/*.min.css'])
        .pipe(gulp.dest(config.build.styles));
    gulp.src(['bower_components/select2/select2.css','bower_components/select2/select2.png'])
        .pipe(gulp.dest(config.build.styles));

    gulp.src(['bower_components/bootstrap-css-only/fonts/**'])//////////
        .pipe(gulp.dest(config.build.fonts));

    gulp.src(['bower_components/font-awesome/css/*.min.css'])
        .pipe(gulp.dest(config.build.styles));

    gulp.src(['bower_components/font-awesome/fonts/**'])
        .pipe(gulp.dest(config.build.fonts));

    gulp.src(['./src/assets/images/**'])
        .pipe(gulp.dest(config.build.images));

    gulp.src(['./index.html'])
        .pipe(gulp.dest(config.build.baseDir));

    return ds();
});*/

gulp.task('default', [ 'scripts', 'styles']);
