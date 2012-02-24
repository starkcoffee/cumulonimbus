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
        internalServerError(res, e);
    })
    .on('end', function() {
        if(!error){
            var path = newFilename();
            fs.rename(upload.tmpFile, path, function(e){
                if(e)
                    internalServerError(res, e);
                else
                    upload.filename = path;
                    uploadResponse(res, upload.filename);
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

app.listen(1337);
console.log('Cumulonimbus running at http://127.0.0.1:1337/');

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
