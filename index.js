
var express = require('express'),
	bodyParser = require('body-parser')
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

var producers = require('./modules/producers.js')(SLRMdb, app, multipartMiddleware);
var providers = require('./modules/providers.js')(SLRMdb, app, multipartMiddleware);

var goods = require('./modules/goods.js')(SLRMdb, app, multipartMiddleware, {
  Categories: categories.model,
  Producers: producers.model,
  Providers: providers.model
});


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});