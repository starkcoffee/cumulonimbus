var express = require('express');
var fs = require('fs');
var formidable = require('formidable');
var util = require('util');
var uuid = require('node-uuid');

var TMP_UPLOAD_DIR = "tmp";
var UPLOAD_DIR = "uploads";

var app = express.createServer();

app.configure(function(){
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });
});

app.get('/', function(req, res){
    res.render("index");
});

app.post('/', function(req, res){
    var form = new formidable.IncomingForm();
    form.uploadDir = TMP_UPLOAD_DIR;
    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      // res.end(util.inspect({fields: fields, files: files}));
      var filename = UPLOAD_DIR + "/" + uuid.v1();
      fs.rename(files.file.path, filename, function(e){
        if(e){
            res.end("exception: " + e);
        }
        res.end("file on server: " + filename);
      });

    });
});

app.listen(1337);
console.log('Cumulonimbus running at http://127.0.0.1:1337/');
