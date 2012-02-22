var express = require('express'),
    fs = require('fs'),
    formidable = require('formidable'),
    util = require('util'),
    uuid = require('node-uuid');

var app = express.createServer();

var db = {"progress-test-id": {
                    filename: "progress-test",
                    tmpFile: "tmp/progress-test",
                    size: 28
                }
          };

app.configure(function(){
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });
});

app.get('/', function(req, res){
    res.render("index");
});

app.post('/upload', function(req, res){
    formidableForm().parse(req, function(err, fields, files) {
      if(notSet(fields.id)){
        badRequest(res, "missing id");
        return;
      }
      if(notSet(files.file)){
        badRequest(res, "wrong fieldname");
        return;
      }

      var filename = newFilename();
      db[fields.id] = {
            filename: filename,
            tmpFile: files.file.path,
            size: files.file.size
        };
      fs.rename(files.file.path, filename, function(e){
        if(e)
            internalServerError(res, e);
        else
            uploadResponse(res, filename);
      });
    });
});


app.post('/confirm', function(req, res){
    formidableForm().parse(req, function(err, fields, files) {
        res.render("confirmed", {
            title: fields.title,
            path: db[fields.id].filename
        });
    });
});


app.get('/progress/:id', function(req, res){
    var uploadInfo = db[req.params.id];
    fs.stat(uploadInfo.tmpFile, function(err, stat){
        if(err){
            fs.stat(uploadInfo.filename, function(err, stat){
                if(err){
                }
                else{
                    res.send({
                        bytes: stat.size,
                        percent: stat.size / uploadInfo.size * 100
                    });
                }
            });
        }
        else{
            res.send({
                bytes: stat.size,
                percent: stat.size / uploadInfo.size * 100
            });
        }
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

function notSet(value){
    return value == undefined || value === ""
}

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
