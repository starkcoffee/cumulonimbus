var vows = require('vows'),
    assert = require('assert'),
    rest = require('restler');


var file = 'test-upload.png',
    stat = require('fs').statSync(file),
    size = stat['size'];

var baseURL = "http://localhost:1337";

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
        'the response contains the path of uploaded file on server': function (err, data, response) {
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
        'the title should be posted and response shows file details': function(err, data, response){
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
        'the response should be bad request': function (err, data, response) {
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
        'the response should be bad request': function (err, data, response) {
            assert.equal(response.statusCode, 400);
            assert.equal(data, "missing id");
        }
    },
    'when confirming without the id':{
        'the response should be bad request': "pending"
    },
    'when confirming without having uploaded the file':{
        'the response should be bad request': "pending"
    }



}).export(module);

function post(relativeURL, form, callbackForAssertion){
   rest.post(baseURL + relativeURL, form)
    .on('complete', function(data, response){
        callbackForAssertion(null, data, response);
    });

};

