var crypto = require('crypto');

var SaltLength = 9;

function generateSalt(len) {
    'use strict';
    var charset = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
    var i, p, charsetLen = charset.length;
    var salt = '';

    for (i = 0; i < len; ++i) {
        p = Math.floor(Math.random() * charsetLen);
        salt += charset[p];
    }
    return salt;
}

function md5(string) {
    'use strict';
    return crypto.createHash('md5')
        .update(string)
        .digest('hex');
}


function createHash(password) {
    'use strict';
    var salt = generateSalt(SaltLength);
    var hash = md5(password + salt);
    return salt + hash;
}

function validateHash(hash, password) {
    'use strict';
    var salt = hash.substr(0, SaltLength);
    var validHash = salt + md5(password + salt);
    return hash === validHash;
}


module.exports = {
    'hash': createHash,
    'validate': validateHash
};