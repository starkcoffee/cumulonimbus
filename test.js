var vows = require('vows'),
    assert = require('assert'),
    rest = require('restler'),
    fs = require('fs');


var file = 'test-upload.png',
    stat = require('fs').statSync(file),
    size = stat['size'],
    baseURL = "http://localhost:1337";


vows.describe('file upload').addBatch({
    'when uploading a file': {
        topic: function(){
            post("/upload",
                {   multipart: true,
                    data: {
                    'file': rest.file(file, file, size),
                    'id' : 'foo'
                    }
                }, this.callback);
        },
        'response contains the path of uploaded file on server': function (err, data, response) {
            assert.equal(response.statusCode, 200);
            assert.match(data, /.*<div id='result'>path on server: uploads.+<\/div>.*/);
        }
    },
    'when confirming after uploading a file':{
        topic: function(){
            var that = this;
            post("/upload",
                {   multipart: true,
                    data: {
                        'file': rest.file(file, file, size),
                        'id': 'foo'
                    }
                }, function(err, data, response){
                    assert.equal(response.statusCode, 200);
                    post("/confirm",
                        {   data: {
                                'title': 'bananas',
                                'id': 'foo'
                            }
                        }, that.callback);
                }
            );
        },
        'title should be posted and response shows file details': function(err, data, response){
            assert.equal(response.statusCode, 200);
            assert.match(data, /.*<p id="title">title is bananas<\/p>.*/);
            assert.match(data, /.*<p id="path">path on server is uploads.+<\/p>.*/);
        }
    },
    'when uploading with the wrong input field name':{
        topic: function(){
            post("/upload",
                {   multipart: true,
                    data: {
                        'bad-file-fieldname': rest.file(file, file, size),
                        'id': 'foo'
                    }
                }, this.callback);
        },
        'response should be bad request': function (err, data, response) {
            assert.equal(response.statusCode, 400);
            assert.equal(data, "wrong fieldname");
        }
    },
    'when uploading without the id':{
        topic: function(){
            post("/upload",
                {   multipart: true,
                    data: {
                        'file': rest.file(file, file, size)
                    }
                }, this.callback);
        },
        'response should be bad request': function (err, data, response) {
            assert.equal(response.statusCode, 400);
            assert.equal(data, "missing id");
        }
    },
    'when confirming without the id':{
        'response should be bad request': "pending"
    },
    'when confirming without having uploaded the file':{
        'response should be bad request': "pending"
    }

}).export(module);

vows.describe("progress status").addBatch({
    // this test uses seeded test data in the datastore, simulating
    // a partial upload
    'when asking for progress of an upload': {
        topic: function(){
            var testFile = fs.openSync("tmp/progress-test", "w");
            fs.writeSync(testFile, "part of a file", 0);
            get("/progress/progress-test-id", this.callback);
        },
        'response should contain bytes and percent so far': function (err, data, response) {
            assert.equal(response.statusCode, 200);
            var json = eval(data);
            assert.equal(json.bytes, "part of a file".length);
            assert.equal(json.percent, 50);
        }
    },
    'when asking for progress when upload has completed': {
        topic: function(){
            var that = this;
            upload("upload-id", file, size, function(err, data, response){
                assert.equal(response.statusCode, 200);
                get("/progress/upload-id", that.callback);
            });
        },
        'response should show total bytes and 100 %': function(err, data, response){
            assert.equal(response.statusCode, 200);
            var json = eval(data);
            assert.equal(json.bytes, size);
            assert.equal(json.percent, 100);
        }
    }
}).export(module);

function post(relativeURL, form, callbackForAssertion){
   rest.post(baseURL + relativeURL, form)
    .on('complete', function(data, response){
        callbackForAssertion(null, data, response);
    });
};

function get(relativeURL, callbackForAssertion){
   rest.get(baseURL + relativeURL)
    .on('complete', function(data, response){
        callbackForAssertion(null, data, response);
    });
};

function upload(id, file, size, callbackForAssertion){
    var form = {    multipart: true,
                    data: {
                        'file': rest.file(file, file, size),
                        'id': id
                    }
               };
    post("/upload", form, callbackForAssertion);
};

