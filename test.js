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
            var topic = this;
            rest.post(baseURL, {
                multipart: true,
                data: {
                    'file': rest.file(file, file, size)
                }
            }).on('complete', function(data, response){
                topic.callback(null, data, response);
            });
        },
        'the response contains the path of uploaded file on server': function (err, data, response) {
            assert.equal(response.statusCode, 200);
            assert.match(data, /.*<div id='result'>path on server: uploads.+<\/div>.*/);
        }
    },
    'when uploading with the wrong input field name':{
        topic: function(){
            var topic = this;
            rest.post(baseURL, {
                multipart: true,
                data: {
                    'bla': rest.file(file, file, size)
                }
            }).on('complete', function(data, response){
                topic.callback(null, data, response);
            });
        },
        'the response should be bad request': function (err, data, response) {
            assert.equal(response.statusCode, 400);
            assert.equal(data, "wrong fieldname");
        }
    }
}).export(module);

