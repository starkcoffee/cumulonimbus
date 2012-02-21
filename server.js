var express = require('express'),
    fs = require('fs'),
    formidable = require('formidable'),
    util = require('util'),
    uuid = require('node-uuid');

var app = express.createServer();

var db = {};

app.configure(function(){
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });
});

app.get('/', function(req, res){
    res.render("index");
});

app.post('/', function(req, res){
    formidableForm().parse(req, function(err, fields, files) {
      //console.log(util.inspect({fields: fields, files: files}));
      if(fields.id == undefined){
        badRequest(res, "missing id");
        return;
      }
      if(files.file == undefined){
        badRequest(res, "wrong fieldname");
        return;
      }

      var filename = newFilename();
      fs.rename(files.file.path, filename, function(e){
        if(e)
            internalServerError(res, e);
        else
            db[fields.id] = filename;
            uploadResponse(res, filename);
      });
    });
});


app.post('/confirm', function(req, res){
    formidableForm().parse(req, function(err, fields, files) {
        res.render("confirmed", {
            title: fields.title,
            path: db[fields.id]
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

function badRequest(res, message){
    res.writeHead(400, {'content-type': 'text/html'});
    res.end(message);
};

function internalServerError(res, e){
    res.writeHead(500, {'content-type': 'text/html'});
    res.end("something bad happened: " + e);
};

function uploadResponse(res, filename){
    res.writeHead(200, {'content-type': 'text/html'});
    res.end("<html><body><div id='result'>path on server: "
            + filename + "</div></body></html>");
};
