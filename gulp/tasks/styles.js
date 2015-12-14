/**
 * Created by bogdanov on 10.09.2015.
 */

'use strict';

import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import source from 'vinyl-source-stream';
import less from 'gulp-less';
import concat  from 'gulp-concat';

import config from '../config.js';
import wrapPipe from '../utils.js';

gulp.task('styles', ['concat-libs-css', 'styles-index'], wrapPipe(function (success, error) {
    return gulp.src(['./sources/stylesheets/style.less'])
        .pipe(sourcemaps.init())
        .pipe(less()).on('error', error)
        //.pipe(postcss([]))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.build.styles));
}));


gulp.task('styles-index', ['concat-libs-css'], wrapPipe(function (success, error) {
    return gulp.src(['./sources/stylesheets/index.less'])
        .pipe(sourcemaps.init())
        .pipe(less()).on('error', error)
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.build.styles));
}));

gulp.task('concat-libs-css', wrapPipe((success, error) => {
    return gulp.src([
        './public/stylesheets/libs/*.css'
    ])
        .pipe(concat('libs.css'))
        .pipe(gulp.dest('./public/stylesheets/'));
}));