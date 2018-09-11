'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');


// folders
const folder = {
  app: 'app',
  dist: 'dist',
  css: `app/css`,
  scss: `app/scss`,
  jsSrc: `app/js`,
  jsDist: `dist/js`,
  imagesSrc: `app/images`,
  imagesDist: `dist/images`,
  fontsSrc: `app/fonts`,
  fontsDist: `dist/fonts`,
}

// ******************
// Development Processes
// ******************


gulp.task('sass', function() { // <-- Converts Sass files to CSS
  return gulp.src(`${folder.scss}/**/*.scss`)
    .pipe(sass())
    .pipe(gulp.dest(folder.css))
    .pipe(browserSync.reload({
      stream: true
    }))
});


gulp.task('browserSync', function() { // <-- browserSync hot reloads
  browserSync.init({
    server: {
      baseDir: folder.app
    },
  })
})


// ******************
// Optimization Processes
// ******************


gulp.task('useref', function() { // <-- Bundle and uglify css and js files
  return gulp.src(`${folder.app}/*.html`)
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify())) // <-- Minify JavaScript files
    .pipe(gulpIf('*.css', cssnano())) // <-- Minify CSS files
    .pipe(gulp.dest(folder.dist))
});


gulp.task('images', function() { // <-- optimize images
  return gulp.src(`${folder.imagesSrc}/**/*.+(png|jpg|gif|svg)`)
  .pipe(cache(imagemin({
    // Setting interlaced to true for GIFs
    interlaced: true
  })))
  .pipe(gulp.dest(folder.imagesDist))
});


gulp.task('fonts', function() { // <-- Copy fonts to dist
  return gulp.src(`${folder.fontsSrc}/**/*`)
  .pipe(gulp.dest(folder.fontsDist))
})


gulp.task('clean:dist', function() { // <-- Clear dist folder
  return del.sync(folder.dist);
})


gulp.task('cache:clear', function (callback) { // <-- Clear cache
  return cache.clearAll(callback)
})


gulp.task('build', function (callback) { // <-- Optimization processes
  runSequence('clean:dist', // <-- Run clean:dist first
    ['sass', 'useref', 'images', 'fonts'], // <-- Run other processes together
    callback
  )
})


// ******************
// Sequences
// ******************


gulp.task('default', function (callback) { // <-- Development Porcesses
  runSequence(['sass','browserSync', 'watch'], // <-- Run processes together
    callback
  )
})


gulp.task('watch', ['browserSync', 'sass'], function() {
  gulp.watch(`${folder.scss}/**/*.scss`, ['sass']); // <-- Reload browser on changes to .scss files
  gulp.watch(`${folder.app}/*.html`, browserSync.reload); // <-- Reload browser on changes to .html files
  gulp.watch(`${folder.jsSrc}/**/*.js`, browserSync.reload); // <-- Reload browser on changes to .js files
})
