var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');

var bundler = watchify(browserify({debug: true}));

// add the file to bundle
bundler.add('./static/js/main.js');

gulp.task('default', bundle);
bundler.on('update', bundle);
bundler.on('log', gutil.log);

function bundle()
{
    bundler.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./static/js'));
}
