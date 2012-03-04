var uuid = require('node-uuid');

var db = {};

function newUploadId(){
    uuid.v1();
};

function newUpload(id){
    db[id] = {};
    return db[id];
};

function getUpload(id){
    return db[id];
};

function newFilename(){
    return "uploads/" + uuid.v1();
};

exports.newUploadId = newUploadId;
exports.newUpload = newUpload;
exports.getUpload = getUpload;
exports.newFilename = newFilename;
