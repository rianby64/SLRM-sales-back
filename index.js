"use strict";

var express = require('express'),
	bodyParser = require('body-parser'),
	multipart = require('connect-multiparty'),
    multipartMiddleware = multipart(),
    Sequelize = require('sequelize'),
    passwordless = require('passwordless'),
    MemStore = require('passwordless-memorystore'),
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session'),
    app = express();

var host = "http://localhost:3000/";
// Setup of Passwordless
passwordless.init(new MemStore());
passwordless.addDelivery(function(tokenToSend, uidToSend, recipient, callback) {
	console.log("\n\nYou can now access your account here: " 
		+ host + "#/authenticate/" + tokenToSend + "/" + encodeURIComponent(uidToSend));
	callback(null);
});

app.use(express.static('./static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.get('/', function(req, res) {
  res.sendfile('./static/index.html');
});

app.use(cookieParser());
app.use(expressSession({secret: '42', saveUninitialized: false, resave: false}));
app.use(passwordless.sessionSupport());

app.post('/login', passwordless.acceptToken({ allowPost: true }),
  function(req, res) {
    if(req.user){
        console.log(req.user);
        res.json("everything is ok");
    }else{
        res.status(401).send("not good");
    }
  });

app.post('/passwordless', 
  passwordless.requestToken(
      // Simply accept every user
      function(user, delivery, callback) {
          var ret = { email: user, id: 213 };
          callback(null, ret.id);
      }),
  function(req, res, next){
      res.send("okay");
  });

app.use('/api/*', passwordless.restricted());

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

var brokers = require('./modules/brokers.js')(SLRMdb, app, multipartMiddleware);

var categories = require('./modules/categories.js')(SLRMdb, app, multipartMiddleware);

var clients = require('./modules/clients.js')(SLRMdb, app, multipartMiddleware, passwordless);

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

brokers.model.sync();
categories.model.sync();
clients.model.sync();
goods.model.sync();
goodsphotos.model.sync();
providers.model.sync();
goodsproviders.model.sync();
commprop.model.sync();
commpropgoods.model.sync();



app.use(function(req, res, next) {
    res.status(404).end();
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});