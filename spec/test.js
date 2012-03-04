var vows = require('vows'),
    assert = require('assert'),
    rest = require('restler'),
    util = require('util'),
    uuid = require('node-uuid'),
    fs = require('fs');


var file = 'spec/test-upload.png',
    stat = require('fs').statSync(file),
    size = stat['size'],
    baseURL = "http://localhost:1337";


vows.describe('file upload').addBatch({
    'when uploading a file': {
        topic: function(){
            post("/upload/"+ uploadId(),
                {   multipart: true,
                    data: {
                    'file': rest.file(file, file, size)
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
            var id = uploadId();
            upload(id, file, size, function(err, data, response){
                assert.equal(response.statusCode, 200);
                post("/confirm/" + id,
                    {   data: {
                            'title': 'bananas'
                        }
                    }, that.callback);
            });
        },
        'title should be posted and response shows file details': function(err, data, response){
            assert.equal(response.statusCode, 200);
            assert.match(data, /.*<p id="title">title is bananas<\/p>.*/);
            assert.match(data, /.*<p id="path">path on server is uploads.+<\/p>.*/);
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
    'when asking for progress of an upload': {
        'response should contain bytes and percent so far': 'pending - hard'
    },
    'when asking for progress when upload has completed': {
        topic: function(){
            var that = this;
            var id = uploadId();
            upload(id, file, size, function(err, data, response){
                assert.equal(response.statusCode, 200);
                get("/progress/" + id, that.callback);
            });
        },
        'response should show total bytes and 100 %': function(err, data, response){
            assert.equal(response.statusCode, 200);
            var json = eval(data);
            assert.equal(json.bytes, 8588);
            assert.equal(json.percent, 100);
        }
    }
}).export(module);

function uploadId(){
    return uuid.v1();
};

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
                        'file': rest.file(file, file, size)
                    }
               };
    post("/upload/" + id, form, callbackForAssertion);
};

