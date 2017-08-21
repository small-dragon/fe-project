var http = require('http');
var url = require('url');

function start(route, handle){
	http.createServer(function(request, response){
		var postData = "";
		var pathname = url.parse(request.url).pathname;
		console.log("Request for" + pathname + " Received");  //在cmd会输出三次，一次document、一次ico文件、另一次是chrome插件：广告终结者

		route(handle, pathname, response, request);
		/*request.setEncoding("utf8");
		request.addListener("data", function(postDataChunk){
			postData += postDataChunk;
			console.log("Received POST data chunk '" + postDataChunk + "'.");
		});

		request.addListener("end", function(){
			route(handle, pathname, response, request);
		})*/
	}).listen(8888);
	console.log("server start");  //在cmd会输出
}

exports.start = start;


