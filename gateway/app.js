'use strict';
var express = require('express');
var proxy = require('express-http-proxy');

var app = express();

app.use('/static', express.static('public'));

// 必须有，用于云引擎健康检查
app.get('/', function(req, res) {
  res.send('ok');
});

app.get('/ping', function(req, res) {
  res.send('gateway pong');
});

app.use('/foo', proxy('backend-app1.leanapp.cn'));
app.use('/bar', proxy('backend-app2.leanapp.cn'));

app.use(function(req, res, next) {
  // 如果任何一个路由都没有返回响应，则抛出一个 404 异常给后续的异常处理器
  if (!res.headersSent) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
});

// error handlers
app.use(function(err, req, res, next) { // jshint ignore:line
  var statusCode = err.status || 500;
  if(statusCode === 500) {
    console.error(err.stack || err);
  }
  res.status(statusCode);
  res.send({error: err});
});

module.exports = app;
