var express = require('express');
var fs = require('fs');
var formidable = require('formidable');
var util = require('util');
var app = express.createServer();

app.configure(function(){
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });
  //  app.use(express.bodyParser());
});

app.get('/', function(req, res){
    res.render("index");
});

app.post('/', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      res.end(util.inspect({fields: fields, files: files}));
    });
});

app.listen(1337);
console.log('Cumulonimbus running at http://127.0.0.1:1337/');
