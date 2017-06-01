var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');
var plumber = require('gulp-plumber');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var open = require('gulp-open');

var config = {
    sourceDir: './src/',
    publicDir: './dist/'
};

/* Scripts task */
gulp.task('scripts', function () {
    return gulp.src([config.sourceDir + 'js/perfomance.js', config.sourceDir + 'js/data-generator.js', config.sourceDir + 'js/index.js'])
        .pipe(concat('app.js'))
        .pipe(gulp.dest(config.sourceDir))
        .pipe(uglify())
        .pipe(gulp.dest(config.publicDir));
});

/* Styles task */
gulp.task('styles', function () {
    return gulp.src(config.sourceDir + '/sass/app.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(autoprefixer())
        .pipe(gulp.dest(config.sourceDir))
        .pipe(cleanCSS())
        .pipe(gulp.dest(config.publicDir))
});

/* HTML min */
gulp.task('minifyHtml', function () {
    return gulp.src(config.sourceDir + 'index.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(config.publicDir));
});

// Open file with default application
gulp.task('openSrc', function(){
    gulp.src('./src/index.html')
        .pipe(open());
});

// Open file with default application
gulp.task('openDist', function(){
    gulp.src('./dist/index.min.html')
        .pipe(open());
});

/* Watch scss, js and html files, doing different things with each. */
gulp.task('default', ['scripts', 'styles', 'openSrc', 'minifyHtml'], function () {
    /* Watch scss, run the sass task on change. */
    gulp.watch(config.sourceDir + 'sass/**/*.*', ['styles']);
    /* Watch app.js file, run the scripts task on change. */
    gulp.watch(config.sourceDir + 'js/**/*.*', ['scripts']);
});

/* Production */
gulp.task('prod', ['scripts', 'styles', 'minifyHtml', 'openDist']);