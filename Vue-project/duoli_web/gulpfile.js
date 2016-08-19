var gulp = require('gulp');
var less = require('gulp-less');
var fileinclude = require('gulp-file-include');
var sourcemaps = require('gulp-sourcemaps');
var LessAutoprefix = require('less-plugin-autoprefix');
var autoprefix = new LessAutoprefix({ browsers: ['last 2 versions'] });
var combiner = require('stream-combiner2');
var browserSync = require('browser-sync').create();
var cache = require('gulp-cached');
var remember = require('gulp-remember');
var cache = require('gulp-cached');
var remember = require('gulp-remember');
var filter = require('gulp-filter');
var plumber = require('gulp-plumber');
var lessChanged = require('gulp-less-changed');
var reload = browserSync.reload;
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});

var paths = {
    css: ["css/**"],
    less: ["less/*.*"],
    lessCommonBase: ["less/common*"],
    lessCommon: ["less/common*", "less/common/**"],
    tpl: ["tpl/**"],
    html: ["*.html"],
    lessFilter: ["less/*.*", "!less/common*", "!less/base*", "!less/lesshat*", "!less/normalize*"],
    tplFilter: ["tpl/*.*"],
    base: "./"
}


gulp.task('html', () => {
    var f = filter(paths.tplFilter);
    return gulp.src(paths.tpl)
        .pipe(f)
        .pipe(plumber())
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file',
            indent: true,
        }))
        .pipe(gulp.dest(paths.base))
        .pipe(browserSync.stream({ once: true }))


});

gulp.task('less', () => {
    var f = filter(paths.lessFilter);
    return gulp.src(paths.less)
        .pipe(f)
        .pipe(cache('less'))
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(less({ plugins: [autoprefix] }))
        .pipe(sourcemaps.write())
        //, (remember('less'))
        .pipe(gulp.dest(paths.base + 'css'))
        .pipe(browserSync.stream({ once: true }))
});

gulp.task('lesscommon', () => {
    return gulp.src(paths.lessCommonBase)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(less({ plugins: [autoprefix] }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.base + 'css'))
        .pipe(browserSync.stream({ once: true }))
})

gulp.task('watch', () => {
    browserSync.init({
        server: {
            baseDir: paths.base,
            directory: true,
            middleware: [
                function (req, res, next) {
                    if(/thpcluster/i.test(req.url)){
                          proxy.web(req, res, { target: 'http://192.183.3.91/' });
                    }
                    else{
                        next();
                    }
                }

            ]
        },
        open: false,
        reloadDelay: 500
    });
    gulp.watch(paths.less, ['less'])
    gulp.watch(paths.tpl, ['html'])
    gulp.watch(paths.lessCommon, ['lesscommon'])


    // browserSync.watch(paths.css,browserSync.reload)
    // browserSync.watch(paths.html,function(){
    //     console.info("ccccc");
    // })

});


gulp.task('build', ['less', 'lesscommon', 'html']);
gulp.task('default', ['watch', 'less', 'lesscommon', 'html']);
