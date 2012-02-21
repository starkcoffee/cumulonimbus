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
            }).on('2XX', function(data, respStatus){
                topic.callback(null, data);
            });
        },
        'the response contains the path of uploaded file on server': function (err, response) {
            assert.match(response, /.*<div id='result'>path on server: uploads.+<\/div>.*/);
        }
    }
}).export(module);
