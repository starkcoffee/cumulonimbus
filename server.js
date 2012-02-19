var express = require('express');
var fs = require('fs');
var formidable = require('formidable');
var util = require('util');
var uuid = require('node-uuid');

var app = express.createServer();

app.configure(function(){
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });
});

app.get('/', function(req, res){
    res.render("index");
});

app.post('/', function(req, res){
    formidableForm().parse(req, function(err, fields, files) {
      // res.end(util.inspect({fields: fields, files: files}));
      var filename = newFilename();
      fs.rename(files.file.path, filename, function(e){
        if(e)
            badResponse(res, e);
        else
            uploadResponse(res, filename);
      });

    });
});

app.listen(1337);
console.log('Cumulonimbus running at http://127.0.0.1:1337/');

function formidableForm(){
    var form = new formidable.IncomingForm();
    form.uploadDir = "tmp";
    return form;
};

function newFilename(){
    return "uploads/" + uuid.v1();
};

function badResponse(res, e){
    res.writeHead(500, {'content-type': 'text/html'});
    res.end("something bad happened: " + e);
};

function uploadResponse(res, filename){
    res.writeHead(200, {'content-type': 'text/html'});
    res.end("<html><body><div id='result'>path on server: "
            + filename + "</div></body></html>");
};
