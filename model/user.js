var db = require('../lib/database');

var findUser = function(login, callback) {
    'use strict';

    console.log(login);
    var sql = 'call User_getInfo(0, ?)';
    db.query(sql, [login], callback);
};

var createUser = function(info, callback) {
    'use strict';

    var sql = 'select User_create(?, ?, ?, ?) as "id"';
    db.query(sql, [info.login, info.pass, info.name, info.email], callback);
};


module.exports = {
    find: findUser,
    create: createUser
};