var gulp = require('gulp');
var less = require('gulp-less');
var fileinclude = require('gulp-file-include');
var sourcemaps = require('gulp-sourcemaps');

var LessAutoprefix = require('less-plugin-autoprefix'),
    autoprefix = new LessAutoprefix({ browsers: ["Android 4.1", "iOS 7.1", "Chrome > 31", "ff > 31", "ie >= 10"]});
var LessPluginCleanCSS = require('less-plugin-clean-css'),
    cleanCSSPlugin = new LessPluginCleanCSS({advanced: true});

var combiner = require('stream-combiner2');

var browserSync = require('browser-sync').create(),
	reload = browserSync.reload;

var httpProxy = require('http-proxy'),
	proxy = httpProxy.createProxyServer({});

var uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	obfuscate = require('gulp-obfuscate');

var del = require('del');
	vinylPaths = require('vinyl-paths');
	
var rev = require('gulp-rev'),
	revCollector = require('gulp-rev-collector');

var paths = {
	base: './', // 为当前目录
	tplFilter: ['src/tpl/*.*'], // *.* 匹配 任何名字的任何文件 
	tpl: ['src/tpl/**'],
	jsFilter: ['src/js/**','!src/js/main.js'],
	less: ['src/less/**'],
	lessFilter: ['src/less/**', '!src/less/base*',  '!src/less/normalize*', '!src/less/animate*', '!src/less/common/**', '!src/less/common*'],
};

//npm i gulp gulp-less gulp-file-include del vinyl-paths gulp-sourcemaps less-plugin-autoprefix stream-combiner2 gulp-uglify gulp-concat gulp-obfuscate gulp-rev gulp-rev-collector less-plugin-clean-css browser-sync http-proxy --save-dev

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
	gulp.watch(paths.jsFilter,['js']);
});

gulp.task('html', function(){
	var combined = combiner.obj([
			gulp.src(paths.tplFilter),
			fileinclude({
				prefix: '@@',
				basepath: '@file', // @file为当前文件位置，也可以是 @root，表示gulp启动的位置
				indent: true,   //是否缩进
			}),
			gulp.dest('./src'),
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
			gulp.dest('src/css'),
			browserSync.stream({ once: true }),
		]);
	combined.on('error', console.error.bind(console));
	return combined;
});

gulp.task('dist-less', ['del'], function(){
	var combined = combiner.obj([
			gulp.src(paths.lessFilter),
			less({ plugins: [autoprefix,cleanCSSPlugin]}),
			rev(),
			gulp.dest('./dist/css'),
			rev.manifest(),
			gulp.dest('./src/rev/css'),
		]);
	combined.on('error', console.error.bind(console));
	return combined;
});

//合并压缩JS
gulp.task('js', function(){
	var combined = combiner.obj([
			gulp.src(paths.jsFilter),
			concat('main.js'),
			gulp.dest('src/js'),
			browserSync.stream({ once: true }),
		]);
	combined.on('error', console.error.bind(console));
	return combined;
});

gulp.task('dist-js', ['del'], function(){
	var combined = combiner.obj([
			gulp.src('src/js/main.js'),
			uglify(),
			rev(),
			gulp.dest('./dist/js'),
			rev.manifest(),
			gulp.dest('./src/rev/js'),
		]);
	combined.on('error', console.error.bind(console));
	return combined;
});

//MD5处理
gulp.task('rev', ['dist-less','dist-js'], function(){
	var combined = combiner.obj([
			gulp.src(['./src/rev/**/*.json', './dist/*.html']),
			revCollector({
				replaceReved: true,
			}),
			gulp.dest('./dist')
		]);
	combined.on('error', console.error.bind(console));
	return combined; 
});

gulp.task('del', function(){
	return gulp.src(['dist/js/*.*','dist/css/*.*'])
		.pipe(vinylPaths(del));
});

gulp.task('add', function(){
	return gulp.src(['src/**', '!src/css/**','!src/less','!src/less/**','!src/js/**','!src/tpl',
		'!src/rev','!src/rev/**','!src/tpl/**'],{base: './src'})
	 .pipe(gulp.dest('dist'));
});


gulp.task('default', ['less', 'html','js','serve-watch']);
gulp.task('dist', ['add','del','dist-less', 'dist-js','rev']);