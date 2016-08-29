var gulp = require('gulp');
var less = require('gulp-less');
var fileinclude = require('gulp-file-include');
var sourcemaps = require('gulp-sourcemaps');

var LessAutoprefix = require('less-plugin-autoprefix'),
    autoprefix = new LessAutoprefix({ browsers: ['last 3 versions']});

var combiner = require('stream-combiner2');

var browserSync = require('browser-sync').create(),
	reload = browserSync.reload;

var httpProxy = require('http-proxy'),
	proxy = httpProxy.createProxyServer({});

var paths = {
	base: './', // 为当前目录
	tplFilter: ['tpl/*.*'], // *.* 匹配 任何名字的任何文件 
	tpl: ['tpl/**'],
	html: ['./*.html'], // ./*.html 匹配当前目录下的 html文件
	less: ['less/**'],
	lessFilter: ['less/**', '!less/base*',  '!less/normalize*', '!less/animate*', '!less/common/**', '!less/common*'],
};

//npm i gulp gulp-less gulp-file-include gulp-sourcemaps less-plugin-autoprefix stream-combiner2 browser-sync http-proxy --save-dev


//开启静态服务器，并设置代理
gulp.task('serve-watch', function(){
	browserSync.init({
		server: {
			baseDir: './',     
			directory: true, 
		},
		open: false,
		reloadDelay: 500
	});
	gulp.watch(paths.less, ['less']);
	gulp.watch(paths.tpl, ['html']);
});

gulp.task('html', function(){
	var combined = combiner.obj([
			gulp.src(paths.tplFilter),
			fileinclude({
				prefix: '@@',
				basepath: '@file', // @file为当前文件位置，也可以是 @root，表示gulp启动的位置
				indent: true,   //是否缩进
			}),
			gulp.dest(paths.base),
			browserSync.stream({ once: true }), //限制每个 stream 只 重载（reload）一次 
		]);
	combined.on('error', console.error.bind(console));
	return combined;
});

gulp.task('less', function(){
	var combined = combiner.obj([
			gulp.src(paths.lessFilter),
			sourcemaps.init(),
			less({ plugins: [autoprefix]}),
			sourcemaps.write(),
			gulp.dest(paths.base + 'css'),
			browserSync.stream({ once: true }),
		]);
	combined.on('error', console.error.bind(console));
	return combined;
});

gulp.task('default', ['less', 'html', 'serve-watch', ]);
gulp.task('build', ['less', 'html']);