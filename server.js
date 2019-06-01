var express = require('express');
var http = require('http');
var app = express();
app.use(express.static("public"));
var server = http.createServer(app);
var port = 8081;


app.get('/', function(req,res) {
    res.send("Hello World");
});


//listen
server.listen(port, function(){
    console.log("API server started on port 8081...");
});