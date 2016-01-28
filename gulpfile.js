var gulp = require('gulp'),
    concatCss = require('gulp-concat-css'),
    minifycss = require('gulp-minify-css'),
    notify = require('gulp-notify'),
    imagemin = require('gulp-imagemin'),
    autoprefixer = require('gulp-autoprefixer'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    uglify = require('gulp-uglify'),
    buffer = require('vinyl-buffer');

gulp.task('default', function() {
    gulp.start('styles', 'copyMedia', 'images', 'browserify-base', 'browserify-control', 'browserify-index');
});

// Css
gulp.task('styles', function() {
    return gulp.src(['public/css/fonts/*.css',
                    'public/css/footer/*.css',
                    'public/css/index/*.css',
                    'public/css/header/*.css',
                    'public/css/control/*.css'
        ])
        .pipe(concatCss("main.min.css"))
        .pipe(autoprefixer('last 2 version'))
        .pipe(minifycss())
        .pipe(gulp.dest('public/dist/css/index/'))
        .pipe(notify({ message: 'Styles task complete' }));
});


gulp.task('copyMedia', function() {
   return gulp.src('public/css/media/*.css')
       .pipe(gulp.dest('public/dist/css/media/'));
});

// Images
gulp.task('images', function() {
    return gulp.src('public/img/*')
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
        .pipe(gulp.dest('public/dist/img'))
        .pipe(notify({ message: 'Images task complete' }));
});

// Scripts
//gulp.task('scripts', function() {
//    return gulp.src(['public/js/base/*.js','public/js/index/*.js'])
//        .pipe(babel({
//            presets: ['es2015']
//        }))
//        .pipe(concat('main.js'))
//        .pipe(gulp.dest('public/dist/js/index/'));
//});


gulp.task('browserify-base', function() {
    return browserify('public/js/base/click_listeners.js')
        .bundle()
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('public/dist/js/base/'));
});

gulp.task('browserify-index', function() {
    return browserify('public/js/index/index.js')
        .bundle()
        .pipe(source('index.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('public/dist/js/index/'));
});


gulp.task('browserify-control', function() {
    return browserify('public/js/control/control.js')
        .bundle()
        .pipe(source('control.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('public/dist/js/control/'));
});

gulp.task('watch', function() {

    // Watch .css files
    gulp.watch(['public/css/**/*.css'], ['styles']);

    // Watch image files
    gulp.watch('public/img/*', ['images']);

    //// Watch .js files

    gulp.watch('public/js/base/*.js',['browserify-base']);
    gulp.watch('public/js/control/*.js',['browserify-control']);
    gulp.watch('public/js/index/*.js',['browserify-index']);
    gulp.watch('public/js/modules/*.js',['browserify-base','browserify-control', 'browserify-index']);



});
