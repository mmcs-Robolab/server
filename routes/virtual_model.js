var router = require('express').Router();
var fs = require('fs');
var checkAuth = require('../lib/checkAuth');


router.get('/', function(req, res, next) {
    'use strict';

    if (checkAuth(req, res, next)) {
        res.render('virtual_model', {title: "Виртуальная модель", username: req.session.username, auth: true});
    } else {

        // TODO auth page
        res.redirect('/');
    }
});

module.exports = router;