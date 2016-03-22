var gulp = require("gulp"),
    watch = require("gulp-watch");
    browserSync = require("browser-sync"),
    reload = browserSync.reload

gulp.task("serve", ["js-start"], function() {
    browserSync({
        server: {
            baseDir: ['./']
        }
    });
});

gulp.task("js", function() {
    return gulp.src('./js/**/*.js')
            .pipe(reload({
                stream: true
            }))
});

gulp.task("js-start", function() {
    watch('./js/**/*.js', function() {
        gulp.start('js');
    });
});