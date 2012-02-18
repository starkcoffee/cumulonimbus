var express = require('express');
var app = express.createServer();

app.configure(function(){
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });
    app.use(express.bodyParser());
});

app.get('/', function(req, res){
    res.render("index");
});

app.post('/', function(req, res){
    res.send(req.body.title);
});

app.listen(1337);
console.log('Cumulonimbus running at http://127.0.0.1:1337/');
