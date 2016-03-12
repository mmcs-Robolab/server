var express = require('express');
var router = express.Router();
var checkAuth = require('../lib/checkAuth');
var article = require('../model/article');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {

  var auth = false;

  if (checkAuth(req, res, next)) {
    auth = true;
  }

  res.render('index', { title: 'Robolab', auth: auth});

});


router.get('/getArticles', function(req, res, next) {
  article.get(function(err, rows) {

    if(err) {
      res.send(err);
      return;
    }

    var result = [];

    for(var i = 0; i < rows.length; ++i) {

      if(rows[i].status == 'draft')
        continue;

      var resObj = {
        html  : rows[i].html,
        title : rows[i].title,
        img   : rows[i].image,
        link  : rows[i].slug,
      };

      result.push(resObj);
    }

    res.send(result);

  })
});

router.get('/getPhotos', function(req, res, next) {
  fs.readdir('./public/img/gallery/', function(err, files) {
    if(err)
      res.send(err);

    var filteredFiles = files.filter(function(file) {
      return file.substr(file.length - 3,3) == 'jpg';
    }).map(function(file) {
      return 'img/gallery/' + file;
    });

    res.send(filteredFiles);
  });
});

module.exports = router;

