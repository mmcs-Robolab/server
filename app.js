var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var SessionStore = require('express-mysql-session');
var config = require('./config');
var ghost = require('./ghost-app/ghost-in-the-middle');

//===============================================
//                  Routes
//===============================================
var routes = require('./routes/index');
var auth = require('./routes/auth');
var registration = require('./routes/registration');
var device = require('./routes/device');
var virtual_model = require('./routes/virtual_model');
//===============================================

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
//===============================================
//                  Sessions
//===============================================

var sessionConfig = config.get('session');
var dbConfig = config.get('db');
var sessionStore = new SessionStore(dbConfig);
sessionConfig.store = sessionStore;

app.use(session(sessionConfig));

//===============================================

app.use(express.static(path.join(__dirname, 'public')));


//===============================================
//                  Use routes
//===============================================

app.use('/', routes);
app.use('/auth', auth);
app.use('/registration', registration);
app.use('/device', device);
app.use('/virtual_model', virtual_model);

app.use( '/articles', ghost({
  config: path.join(__dirname, 'ghost-app/config.js')
}) );
//===============================================

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
