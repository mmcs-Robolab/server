var gulp = require('gulp'),
    concatCss = require('gulp-concat-css'),
    minifycss = require('gulp-minify-css'),
    notify = require('gulp-notify'),
    imagemin = require('gulp-imagemin'),
    autoprefixer = require('gulp-autoprefixer');


gulp.task('default', function () {
    gulp.start('styles', 'images');
});

// Css
gulp.task('styles', function() {
    return gulp.src(['public/css/**/*.css'])
        .pipe(concatCss("main.min.css"))
        .pipe(autoprefixer('last 2 version'))
        .pipe(minifycss())
        .pipe(gulp.dest('public/dist/css/index/'))
        .pipe(notify({ message: 'Styles task complete' }));
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
//    return gulp.src('src/scripts/**/*.js')
//        .pipe(jshint('.jshintrc'))
//        .pipe(jshint.reporter('default'))
//        .pipe(concat('main.js'))
//        .pipe(gulp.dest('dist/scripts'))
//        .pipe(rename({ suffix: '.min' }))
//        .pipe(uglify())
//        .pipe(gulp.dest('dist/scripts'))
//        .pipe(notify({ message: 'Scripts task complete' }));
//});

gulp.task('watch', function() {

    // Watch .css files
    gulp.watch(['public/css/**/*.css'], ['styles']);

    // Watch image files
    gulp.watch('public/img/*', ['images']);

    //// Watch .js files
    //gulp.watch('src/scripts/**/*.js', ['scripts']);
    //


});
