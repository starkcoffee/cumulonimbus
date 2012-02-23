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

      var uploadInfo = store(fields.id, files.file);
      fs.rename(files.file.path, uploadInfo.filename, function(e){
        if(e)
            internalServerError(res, e);
        else
            uploadResponse(res, uploadInfo.filename);
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
    checkFile(uploadInfo.tmpFile, function(exists, stat){
        if(exists)
            progressResponse(res, stat.size, uploadInfo.size)
        else
            checkFile(uploadInfo.filename, function(exists, stat){
                progressResponse(res, stat.size, uploadInfo.size)
            });
    });
});


app.listen(1337);
console.log('Cumulonimbus running at http://127.0.0.1:1337/');

function store(id, file){
    db[id] = {
        filename: newFilename(),
        tmpFile: file.path,
        size: file.size
    };
    return db[id];
};

function progressResponse(res, currentSize, finalSize){
    res.send({
        bytes: currentSize,
        percent: currentSize / finalSize * 100
   });
}

// callback = function(fileExists, stat){..
function checkFile(filename, callback){
    fs.stat(filename, function(err, stat){
        if (err){
            if (err.code == 'ENOENT')
                callback(false, stat);
            else
                throw new Error(err.Error);
        }
        else
            callback(true, stat);
    });
};

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
