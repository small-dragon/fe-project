var querystring = require('querystring'),
	fs = require('fs'),
	formidable = require('formidable');

function sleep(milliseconds){
	var startTime = new Date().getTime();
	while(new Date().getTime() < startTime + milliseconds);
}

function start(response, request){
	console.log("Request handler 'start' was called");
	var content = 'empty';
   	
   	var body = '<html>'+
	    '<head>'+
	    '<meta http-equiv="Content-Type" content="text/html; '+
	    'charset=UTF-8" />'+
	    '</head>'+
	    '<body>'+
	    '<form action="/upload" method="post" enctype="multipart/form-data">'+
	    '<input type="file" name="upload">' + 
	    '<input type="submit" value="Upload file" />'+
	    '</form>'+
	    '</body>'+
	    '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

function upload(response, request){
	console.log("Request handler 'upload' was called.");

	var form = new formidable.IncomingForm();
	console.log('r' + request);
	form.parse(request, function(error, fields, files){
		console.log("parsing done");
		fs.renameSync(files.upload.path, "c:/tmp/test.png");
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("received image:<br/>");
		response.write("<img src='/show'>");
	  	response.end();
	});
  	
}

function show(response, request) {
	console.log("Request handler 'show' was called");
	response.writeHead(200, {"Content-Type": "image/png"});
	fs.createReadStream("c:/tmp/test.png").pipe(response);
	/*fs.readFile("c:/tmp/test.png", "binary", function(error, file){
		if(error) {
			response.writeHead(500, {"Content-Type": "text/plain"});
			response.write(error + "\n");
			response.end();
		} else {
			response.writeHead(200, {"Content-Type": "image/png"});
			response.write(file, "binary");
			response.end();
		}
	});*/
}

exports.start = start;
exports.upload = upload;
exports.show = show;