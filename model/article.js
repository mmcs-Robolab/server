var db = require('../lib/database');

var getArticle = function(callback) {
    'use strict';

    var sql = 'select * from posts order by posts.updated_at desc limit 4;';
    db.query(sql, callback);

};

module.exports = {
    get: getArticle
};