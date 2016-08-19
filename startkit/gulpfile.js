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
	tpl: ['tpl/*.*'], // *.* 匹配 任何名字的任何文件 
	html: ['./*.html'], // ./*.html 匹配当前目录下的 html文件
	css: ['css/**'],   // ** 任何文件/文件夹
	less: ['less/**', '!less/base*', '!less/lesshat*', '!less/normalize*', '!less/common/**', '!less/animate*', '!less/common'],  //为何有两个 common 呢
};


//开启静态服务器，并设置代理
gulp.task('serve-watch', function(){
	browserSync.init({
		server: {
			baseDir: './',     //Serve files from the current directory with directory listing
			directory: true,
			middleware: [      //设置中间件，代理
				function(req, res, next) {
					if(/thpcluster/i.test(req.url)){
                          proxy.web(req, res, { target: 'http://192.183.3.91/' });
                    }
                    else{
                        next();
                    }
				}
			],
			open: true, //开启服务器之后是否自动打开浏览器
			reloadDelay: 500,  //Time, in milliseconds, to wait before instructing the browser to reload/inject following a file change event
		},
	});
	gulp.watch(paths.less, ['less']);
	gulp.watch(paths.tpl, ['html']);
});

//默认情况下，在 stream中 发生一个错误的话，它会被直接抛出，除非已经有一个时间监听器监听着 error 事件
//这在处理一个比较长的管道操作的时候会显得比较棘手
//通过使用 stream-combiner2 ，你可以将一系列的 stream 合并成一个
//这意味着，你只需要在你的代码中的一个地方添加一个监听器听 error 事件即可
//文档： http://www.gulpjs.com.cn/docs/recipes/combining-streams-to-handle-errors/
//类似的插件还有 plumber

//gulp-file-include：把公用的 header、footer 等引入到页面中，类似java的 include 方法
//文档：https://github.com/coderhaoxin/gulp-file-include
gulp.task('html', function(){
	var combined = combiner.obj([
			gulp.src(paths.tpl),
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

// sourcemaps：用来调试代码的，比如你压缩了JS，打开Chrome控制台（其他貌似不支持）就能看到未压缩的代码
// less生成CSS，调试的时候 Chrome会把解析CSS成less，非常方便
//文档：https://www.npmjs.com/package/gulp-sourcemaps
gulp.task('less', function(){
	var combined = combiner.obj([
			gulp.src(paths.less),
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