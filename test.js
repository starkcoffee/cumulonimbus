var vows = require('vows'),
    assert = require('assert'),
    rest = require('restler');


var file = 'test-upload.png',
    stat = require('fs').statSync(file),
    size = stat['size'];

var baseURL = "http://localhost:1337/";

vows.describe('file upload').addBatch({
    'when uploading a file': {
        topic: function(){
            post({
                multipart: true,
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
    'when uploading with the wrong input field name':{
        topic: function(){
            post({
                multipart: true,
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
            post({
                multipart: true,
                data: {
                    'file': rest.file(file, file, size)
                }
            }, this.callback);
        },
        'the response should be bad request': function (err, data, response) {
            assert.equal(response.statusCode, 400);
            assert.equal(data, "missing id");
        }
    }

}).export(module);

function post(form, callbackForAssertion){
   rest.post(baseURL, form)
    .on('complete', function(data, response){
        callbackForAssertion(null, data, response);
    });

};

