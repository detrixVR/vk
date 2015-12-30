

'use strict';

import gulp from 'gulp';
import browserify from 'browserify';
import babelify from 'babelify';
import stringify from 'stringify';
import sourcemaps from 'gulp-sourcemaps';
import source from 'vinyl-source-stream';
import eslint from 'gulp-eslint';
import concat  from 'gulp-concat';

import config from '../config.js';
import wrapPipe from '../utils.js';

// jshint or jslint or eslint
/*gulp.task('eslint', () => {
    return gulp.src('./src/app/**.js')
//        .pipe(eslint())
//        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});
*/
gulp.task('scripts', ['concat-libs-js'], wrapPipe((success, error) => {
    return browserify(['./sources/javascripts/entry.js'], {debug: true})
       /* .transform(stringify({
            extensions: ['.html'],
            minify: true
        })).on('error', error)*/
        .transform(babelify.configure({
            optional: ["es7.decorators"],
            sourceMapRelative:'.'
        })).bundle().on('error', error)
        .pipe(source('app.js'))
        .pipe(gulp.dest(config.build.scripts));
}));

gulp.task('concat-libs-js', wrapPipe((success, error) => {
    return gulp.src([
            './public/javascripts/libs/jquery-2.1.4.min.js',
            './public/javascripts/libs/socket.io-1.3.7.js',
            './public/javascripts/libs/bootstrap.min.js',
            './public/javascripts/libs/bootstrap-notify.min.js',
            './public/javascripts/libs/jasny-bootstrap.min.js',
            './public/javascripts/libs/bootstrap-select.min.js',
            './public/javascripts/libs/jquery.bootgrid.js',
            './public/javascripts/libs/jquery.bootgrid.extend.js',
            './public/javascripts/libs/underscore-min.js',
            './public/javascripts/libs/jquery.mousewheel.js',
            './public/javascripts/libs/jquery.jscrollpane.min.js',
            './public/javascripts/libs/bootstrap3-typeahead.js',
            './public/javascripts/libs/bootstrap3-typeahead.extend.js'
        ])
        .pipe(concat('libs.js'))
        .pipe(gulp.dest('./public/javascripts/'));
}));