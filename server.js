var express = require('express');

var app = express.createServer();

app.get('/', function(req, res){
    res.send('Hello World');
});

app.listen(1337);
console.log('Cumulonimbus running at http://127.0.0.1:1337/');
