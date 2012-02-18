var vows = require('vows'),
    assert = require('assert'),
    Browser = require("zombie");

var browser = new Browser();

vows.describe('first page').addBatch({
    'when requesting first page': {
        topic: function(){
            browser.visit("http://localhost:1337/", this.callback);
        },
        'we get Hello World': function (err, browser) {
            assert.ok(browser.success);
            assert.equal (browser.html(), "Hello World\n");
        }
    }
}).export(module);
