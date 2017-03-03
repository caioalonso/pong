'use strict'

var gulp = require('gulp')
var babel = require('gulp-babel')
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify')
var concat = require('gulp-concat')

var paths = {
  scripts: ['public/js/**/*.js']
};

gulp.task('scripts', function () {
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .on('error', function(e) {
      console.log('>>> ERROR', e)
      this.emit('end')
    })
    .pipe(uglify())
    .pipe(concat('dist/main-compiled.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public'))
});

gulp.task('default', function() {
  gulp.watch(paths.scripts, ['scripts'])
})
