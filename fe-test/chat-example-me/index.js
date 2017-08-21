var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
});

var i = 0;
function getUser () {
    return `user${i++}`
}
io.on('connection', function(socket){
    socket.on('disconnect', function(){
        console.log('user disconnected');
    })
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    })
    socket.on('get user', function(){
        io.emit('get user', getUser());
    })
})

http.listen(3000, function(){
    console.log('listening on *: 3000')
})