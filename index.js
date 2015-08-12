"use strict";

var express = require('express'),
	bodyParser = require('body-parser'),
	multipart = require('connect-multiparty'),
    multipartMiddleware = multipart(),
    Sequelize = require('sequelize'),
    app = express();

app.use(express.static('./static'));
app.use(bodyParser.json());
app.get('/', function(req, res) {
  res.sendfile('./static/index.html');
});

var SLRMdb = new Sequelize('slrm', 'slrm', 'slrm', {
  host: 'localhost',
  dialect: 'sqlite',
  storage: './db/SLRMdb.sqlite'
});

var AUTHdb = new Sequelize('auth', 'auth', 'auth', {
  host: 'localhost',
  dialect: 'sqlite',
  storage: './db/AUTHdb.sqlite'
});

var auth = require('./modules/auth.js')(AUTHdb, app, multipartMiddleware);

var brokers = require('./modules/brokers.js')(SLRMdb, app, multipartMiddleware);

var categories = require('./modules/categories.js')(SLRMdb, app, multipartMiddleware);

var clients = require('./modules/clients.js')(SLRMdb, app, multipartMiddleware);

var providers = require('./modules/providers.js')(SLRMdb, app, multipartMiddleware);

var goods = require('./modules/goods.js')(SLRMdb, app, multipartMiddleware, {
  Categories: categories.model
});

var goodsproviders = require('./modules/goodsproviders.js')(SLRMdb, app, multipartMiddleware, {
  Providers: providers.model,
  Goods: goods.model
});

var goodsphotos = require('./modules/goodsphotos.js')(SLRMdb, app, multipartMiddleware, {
  Goods: goods.model
});

var commprop = require('./modules/commprop.js')(SLRMdb, app, multipartMiddleware, {
  Client: clients.model,
  Broker: brokers.model
});

var commpropgoods = require('./modules/commpropgoods.js')(SLRMdb, app, multipartMiddleware, {
  Commprop: commprop.model,
  Goods: goods.model
});

auth.model.sync();
brokers.model.sync();
categories.model.sync();
clients.model.sync();
goods.model.sync();
goodsphotos.model.sync();
providers.model.sync();
goodsproviders.model.sync();
commprop.model.sync();
commpropgoods.model.sync();
  


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});