'use strict';

const log = require('fancy-log');
const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const config = require('./package');
const eslint = require('gulp-eslint');
const replace = require('gulp-replace');
const plumber = require('gulp-plumber');
const prefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const livereload = require('gulp-livereload');

const path = {
  build: {
    enonic: 'build/resources/main/assets/js',
    styles: 'build/styles/'
  },
  src: {
    css: ['node_modules/toastr/build/toastr.min.css'],
    style: ['./styles/styles.scss'],
    libs: [
      'node_modules/moment/min/moment.min.js',
      'node_modules/lodash/lodash.min.js',
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/jquery-ui-dist/jquery-ui.min.js',
      'node_modules/popper.js/dist/umd/popper.min.js', // Popper.js is required by Bootstrap
      'node_modules/imagesloaded/imagesloaded.pkgd.min.js', // Jquery plugin to wait for image loading
      'node_modules/bootstrap/dist/js/bootstrap.min.js',
      'node_modules/axios/dist/axios.min.js', // Ajax as promise
      'node_modules/highcharts/highcharts.js',
      'node_modules/highcharts/modules/exporting.js',
      'node_modules/highcharts/modules/data.js',
      'dist/main.js'
    ]
  },
  watch: {
  },
  clean: './build'
};

// -----------------------------------------------------------------------------
// cleanup
// -----------------------------------------------------------------------------
function clean() {
  rimraf(path.clean, cb);
}

// -----------------------------------------------------------------------------
// frontend libs
// -----------------------------------------------------------------------------
function libs() {
  return gulp.src(path.src.libs)
    .pipe(concat('libs.js'))
    .pipe(gulp.dest(path.build.enonic));
}

// -----------------------------------------------------------------------------
// backend javascript
// -----------------------------------------------------------------------------
function backend() {
  return gulp.src('src/main/resources/**/*.es6')
    .pipe(plumber())
    .pipe(eslint({ configFile: '.eslintrc.json' }))
    .pipe(eslint.format())
    .pipe(replace('%%VERSION%%', config.version))
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(plumber.stop())
    .pipe(gulp.dest('build/resources/main'));
}

// -----------------------------------------------------------------------------
// design system
// -----------------------------------------------------------------------------

function designsystem() {
  return gulp.src(['../ssb-component-library/src/**/*scss'])
    .pipe(gulp.dest('styles/ssb-component-library'));
}

// -----------------------------------------------------------------------------
// js backend assets
// -----------------------------------------------------------------------------

function assets() {
  return gulp.src(['node_modules/moment/min/moment-with-locales.js', 'node_modules/numeral/numeral.js', 'node_modules/jsonstat/export.js'])
    .pipe(gulp.dest('build/resources/main/lib'));
}

// -----------------------------------------------------------------------------
// frontend javascript
// -----------------------------------------------------------------------------
function frontend() {
  return gulp.src(['app/main.es6', 'app/**/*.es6'])
    .pipe(plumber())
    .pipe(eslint({ configFile: '.eslintrc.json' }))
    .pipe(eslint.format())
    .pipe(replace('%%VERSION%%', config.version))
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(concat('main.js'))
    .pipe(plumber.stop())
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
}

// -----------------------------------------------------------------------------
// styles
// -----------------------------------------------------------------------------
function styles() {
  return gulp.src(path.src.style)
    .pipe(plumber(function (error) {
      log.error(error.message);
      this.emit('end');
    }))
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: ['styles/'],
      errLogToConsole: true
    }))
    .pipe(prefixer({
      cascade: true
    }))
    .pipe(plumber.stop())
    // .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('.'))
    // .pipe(gulp.dest(path.build.styles))
    .pipe(gulp.dest('build/resources/main/assets/css/'))
    .pipe(livereload());
}

// -----------------------------------------------------------------------------
// watch
// -----------------------------------------------------------------------------
function watch() {
  livereload.listen()
  gulp.watch(['app/**/*.es6'], gulp.series(frontend, libs));
  gulp.watch(['src/**/*.es6'], backend);
  gulp.watch(['src/**/*.html'], gulp.series(frontend, libs));
  gulp.watch(['styles/**/*.scss', 'src/**/*scss'], styles);
}

exports.designsystem = designsystem;
exports.styles = styles;
exports.backend = backend;
exports.assets = assets;
exports.scripts = frontend;
exports.frontend = gulp.series(styles, frontend, libs);
exports.build = gulp.series(styles, assets, backend, frontend, libs);
exports.default = gulp.series(styles, assets, backend, frontend, libs, watch);
