/**
 * Created by bogdanov on 10.09.2015.
 */

'use strict';

import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import source from 'vinyl-source-stream';
import less from 'gulp-less';

import config from '../config.js';
import wrapPipe from '../utils.js';

gulp.task('styles', wrapPipe(function (success, error) {
    return gulp.src(['./sources/stylesheets/style.less'])
        .pipe(sourcemaps.init())
        .pipe(less()).on('error', error)
        //.pipe(postcss([]))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.build.styles));
}));