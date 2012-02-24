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

app.post('/upload/:id', function(req, res){
    var form = new formidable.IncomingForm(),
        id = req.params.id,
        error = false;

    form.uploadDir = "tmp";

    db[id] = {};

    form.on('progress', function(bytesReceived, bytesExpected) {
       db[id].bytes = bytesReceived;
       db[id].percent = bytesReceived / bytesExpected * 100;
    })
    .on('file', function(name, file){
        db[id].tmpFile = file.path;
    })
    .on('error', function(e){
        internalServerError(res, e);
    })
    .on('end', function() {
        if(!error){
            var path = newFilename();
            fs.rename(db[id].tmpFile, path, function(e){
                if(e)
                    internalServerError(res, e);
                else
                    db[id].filename = path;
                    uploadResponse(res, path);
            });
        }
    });
    form.parse(req);

});

app.post('/confirm/:id', function(req, res){
    var filename = db[req.params.id].filename;
    formidableForm().parse(req, function(err, fields, files) {
        res.render("confirmed", {
            title: fields.title,
            path: db[req.params.id].filename
        });
    });
});

app.get('/progress/:id', function(req, res){
    var uploadInfo = db[req.params.id];
    res.send({
        bytes: uploadInfo.bytes,
        percent: uploadInfo.percent
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
