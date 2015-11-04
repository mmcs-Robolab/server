var mysql = require('mysql');
var config = require('../config/');

var dbSettings = config.get('db');
var connectionPool = mysql.createPool(dbSettings);

module.exports = connectionPool;