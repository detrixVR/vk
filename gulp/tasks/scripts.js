

'use strict';

import gulp from 'gulp';
import browserify from 'browserify';
import babelify from 'babelify';
import stringify from 'stringify';
import sourcemaps from 'gulp-sourcemaps';
import source from 'vinyl-source-stream';
import eslint from 'gulp-eslint';

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
gulp.task('scripts', wrapPipe((success, error) => {
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