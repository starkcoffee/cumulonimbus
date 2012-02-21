// BROKEN - ZOMBIE DOESNT WORK WITH MULTIPART - SEE ISSUES

var vows = require('vows'),
    assert = require('assert'),
    Browser = require("zombie");

var site = "http://localhost:1337/";
Browser.debug = true;
var b = new Browser();

vows.describe('upload page').addBatch({
    'when posting a title': {
        topic: function(){
            var topic = this;
            b.visit(site, function(err, b){
                assert.ok(b.success);
                b.fill("title", "Menacing Cloud");
                b.pressButton("submit", topic.callback);
            });
        },
        'we get the title back as response': function (err, b) {
            assert.equal(b.html(), "Menacing Cloud");
        }
    }
}).export(module);
