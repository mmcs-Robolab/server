module.exports = function(req, res, next) {
    'use strict';
    return Boolean(req.session.userId);
};