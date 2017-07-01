var express = require('express');
var os = require('os');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mo = require('./engine/mo');
var dr = require('./engine/dr');

//Service
var moR = require('./engine/mo-read');
var drR = require('./engine/dr-read');

//Apps
var appBola = require('./engine/apps/bola');

//Telcp
var xl = require('./engine/telco/xl');

var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

app.use('/mo', mo);
app.use('/dr', dr);

// error handler
//app.use(function(err, req, res, next) {
//  // set locals, only providing error in development
//  res.locals.message = err.message;
//  res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//  // render the error page
//  res.status(err.status || 500);
//  res.render('error');
//});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
//  var err = new Error('Not Found');
//  err.status = 404;
//  next(err);
    res.status(404).send('404');
});

//Error Handling
app.get('*', function (req, res) {
    res.status(404).send('404');
});

// Server
app.listen(3000, function () {
    console.log('SMS ENGINE 2017 BY MOBIWIN');
    console.log('------------------------------');
    // Monitoring
    console.log('Operating system \t : ' + os.platform() + ' ' + os.arch() + ' ' + os.type());
    console.log('Memory Capacity \t : ' + parseInt(os.totalmem()) / 1000000 + ' Mb');
    console.log('Free Memory \t \t : ' + parseInt(os.freemem()) / 1000000 + ' Mb');
    console.log('Home Dir \t \t : ' + os.homedir());
    console.log('Hostname \t \t : ' + os.hostname());
    console.log('------------------------------');
});
