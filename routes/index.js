var express = require('express');
var router = express.Router();
var checkAuth = require('../lib/checkAuth');

/* GET home page. */
router.get('/', function(req, res, next) {
  var auth = false;

  if (checkAuth(req, res, next)) {
    auth = true;
  }
  res.render('index', { title: 'Robolab', auth: auth });
});

module.exports = router;
