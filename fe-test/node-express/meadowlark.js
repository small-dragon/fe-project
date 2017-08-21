//程序文件
var express = require('express');
var fortune = require('./lib/fortune.js');

var app = express();
//设置 handlebars 视图引擎 
var handlebars = require('express3-handlebars')
.create({defaultLayout: 'main'}); //设置默认布局为main.handlebars
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.disable('x-powered-by');
app.set('port', process.env.PORT || 3000);

//加在所有路由之前
app.use(express.static(__dirname +　'/public'));

app.get('/', function(req, res){
	res.render('home');
});

app.get('/headers', function(req, res){
	res.set('Content-Type', 'text/plain');
	var s = '';
	for(var name in req.headers) s+= name + ':' + req.headers[name] + '\n';
	res.send(s);
});

app.get('/about', function(req, res){
	res.render('about', { fortune: fortune.getFortune()});
});

app.get('/greeting', function(req, res){
res.render('about', {
		message: 'welcome',
		style: req.query.style,
		userid: req.cookie.userid,
		username: req.session.username,
	});
});

app.get('/no-layout', function(req, res){
	res.render('no-layout', { layout: null });
});

//定制404页面
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

//定制500页面
app.use(function(error, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function(){
	console.log("Express started on http://localhost:" + 
		app.get('port') +　'; press Ctrl +　Ｃ to termainal.');
});