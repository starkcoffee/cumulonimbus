var express = require('express'),
    fs = require('fs'),
    formidable = require('formidable'),
    util = require('util'),
    uuid = require('node-uuid'),
    r = require('./responses'),
    static = require('node-static');

var app = express.createServer();
var fileServer = new(static.Server)('./public');
var db = {};

app.configure(function(){
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });
});

app.get('/static/*', function(req,res){
    fileServer.serve(req,res);
});

app.get('/', function(req, res){
    res.render("index", {uploadId: uuid.v1()});
});

app.post('/upload/:id', function(req, res){
    var form = new formidable.IncomingForm(),
        id = req.params.id,
        error = false;

    form.uploadDir = "tmp";

    var upload = newUpload(id);

    form.on('progress', function(bytesReceived, bytesExpected) {
       upload.bytes = bytesReceived;
       upload.percent = bytesReceived / bytesExpected * 100;
    })
    .on('file', function(name, file){
        upload.tmpFile = file.path;
    })
    .on('error', function(e){
        r.internalServerError(res, e);
    })
    .on('end', function() {
        if(!error){
            var path = newFilename();
            fs.rename(upload.tmpFile, path, function(e){
                if(e)
                    r.internalServerError(res, e);
                else
                    upload.filename = path;
                    r.uploadResponse(res, upload.filename);
            });
        }
    });
    form.parse(req);

});

app.post('/confirm/:id', function(req, res){
    var filename = getUpload(req.params.id).filename;
    formidableForm().parse(req, function(err, fields, files) {
        res.render("confirmed", {
            title: fields.title,
            path: db[req.params.id].filename
        });
    });
});

app.get('/progress/:id', function(req, res){
    var upload = getUpload(req.params.id);
    res.send({
        bytes: upload.bytes,
        percent: upload.percent
   });
});

var port = process.env.PORT || 1337;
app.listen(port, function() {
  console.log("Listening on " + port);
});

function newUpload(id){
    db[id] = {};
    return db[id];
};

function getUpload(id){
    return db[id];
};

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


