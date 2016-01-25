"use strict";

var express = require('express'),
  bodyParser = require('body-parser'),
  multipart = require('connect-multiparty'),
  multipartMiddleware = multipart(),
  Sequelize = require('sequelize'),
  passwordless = require('passwordless'),
  MemoryStore = require('passwordless-memorystore'),
  email = require("emailjs"),
  cookieParser = require('cookie-parser'),
  expressSession = require('express-session'),
  app = express();


var smtpServer  = email.server.connect({
   user:    'info_matematico_pro',
   password:'geometria64',
   host:    'smtp.matematico.pro',
   ssl:     false
});


// Setup of Passwordless
passwordless.init(new MemoryStore());
passwordless.addDelivery(function(tokenToSend, uidToSend, recipient, callback) {
  var host = 'manager.spa-land.ru',
      message = {
        text:    'Hello!\nAccess your account here: http://' + host + "/#/authenticate/" + tokenToSend + "/" + encodeURIComponent(uidToSend), 
        from:    'robot@manager.spa-land.ru', 
        to:      recipient,
        subject: 'Token for ' + host
      };
  console.log(message);
  smtpServer.send(message);

  callback(null);
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static('./static'));


app.use(cookieParser());
app.use(expressSession({secret: 'cat keyboard', saveUninitialized: false, resave: false}));
app.use(passwordless.sessionSupport());



//var AUTHdb = new Sequelize('auth', 'auth', 'auth', {
//  host: 'localhost',
//  dialect: 'sqlite',
//  storage: './db/AUTHdb.sqlite'
//});

var AUTHdb = new Sequelize('postgres://slrm:slrm@localhost:5432/slrm-users');

var users = require('./modules/users.js')(AUTHdb, app, multipartMiddleware);
users.model.sync();


app.post('/login', passwordless.acceptToken({ allowPost: true }),
  function(req, res) {
    if(req.user){
      res.status(200).end();
    }else{
      res.status(401).end();
    }
  });

app.get('/logout', passwordless.logout(),
  function(req, res) {
    res.status(200).end();
  });

app.post('/passwordless',
  passwordless.requestToken(
    // Simply accept every user
    function(email, delivery, callback) {
      users.model.findOne({ where: {email: email} }).then(function(entry) {
        if (entry) {
          callback(null, entry.uuid);
          return;
        }
        callback(null, null);
      });
    }
  ),
  function(req, res) {
    res.status(200).end();
  });

app.get('/check',
  passwordless.restricted(),
  function(req, res) {
    return users.model.findOne({ where: {uuid: req.user} }).then(function(entry) {
      if (entry) {
        res.json(entry);
      }
      res.status(401).end();
    });
  });
app.use('/api/*', passwordless.restricted()); // to restrict::uncoment

//var SLRMdb = new Sequelize('slrm', 'slrm', 'slrm', {
//  host: 'localhost',
//  dialect: 'sqlite',
//  storage: './db/SLRMdb.sqlite'
//});

var SLRMdb = new Sequelize('postgres://slrm:slrm@localhost:5432/slrm');

var brokers = require('./modules/brokers.js')(SLRMdb, app, multipartMiddleware);

var categories = require('./modules/categories.js')(SLRMdb, app, multipartMiddleware);

var clients = require('./modules/clients.js')(SLRMdb, app, multipartMiddleware, passwordless);

var providers = require('./modules/providers.js')(SLRMdb, app, multipartMiddleware);

var goods = require('./modules/goods.js')(SLRMdb, app, multipartMiddleware, {
  Categories: categories.model,
  Providers: providers.model
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

var commpropvariants = require('./modules/commpropvariants.js')(SLRMdb, app, multipartMiddleware, {
  Commprop: commprop.model
});

var commpropgoods = require('./modules/commpropgoods.js')(SLRMdb, app, multipartMiddleware, {
  CommpropVariants: commpropvariants.model,
  Goods: goods.model,
  Providers: providers.model
});

var orderform = require('./modules/orderform.js')(SLRMdb, app, multipartMiddleware, {
  Commprop: commprop.model,
  CommpropVariants: commpropvariants.model,
  Client: clients.model,
  Broker: brokers.model
});

brokers.model.sync();
categories.model.sync();
clients.model.sync();
goods.model.sync();
goodsphotos.model.sync();
providers.model.sync();
goodsproviders.model.sync();
commprop.model.sync();
commpropvariants.model.sync();
commpropgoods.model.sync();
orderform.model.sync();


app.use(function(req, res, next) {
    res.status(404).end();
});

var server = app.listen(3000, 'localhost', function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
