var Browser = require("zombie");
var assert = require("assert");

// Load the page from localhost
browser = new Browser()
browser.visit("http://localhost:1337/", function () {
    assert.ok(browser.success);
    assert.equal(browser.html(), "Hello World\n");
});
