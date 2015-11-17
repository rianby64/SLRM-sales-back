
module.exports = function (sequelize, app, multipartMiddleware) {

  var Sequelize = require('sequelize'),
      tableAPI = require('../tableAPI.js');

  var Providers = sequelize.define('providers', {
    organization_name: Sequelize.TEXT,
    legal_name: Sequelize.TEXT,
    inn: Sequelize.INTEGER,
    requeriments: Sequelize.TEXT,
    
    telephone: Sequelize.TEXT,
    address: Sequelize.TEXT,
    email: Sequelize.TEXT,
    
    type: Sequelize.TEXT,
    comments: Sequelize.TEXT
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  var providers = tableAPI.setup(Providers, sequelize);
  
  app.post('/api/providers/upload', multipartMiddleware, providers.upload);
  app.get('/api/providers', function list(req, res) {
    var search = { $or: { }};
    if (req.query.hasOwnProperty('type')) {
      search.$and = { type: req.query.type };
    }
    if (req.query) {
      if ((req.query.search) && (req.query.search.length > 0)) {
        for (var attr in Providers.attributes) {
          if (attr === 'id') continue;
          search.$or[attr] = sequelize.where(sequelize.cast(sequelize.col(attr), 'text'), { $ilike: '%' + req.query.search + '%' });
        }
      }
    }
    return Providers.findAll({ where: search }).then(function(entries) {
      res.json(entries);
    });
  });
  app.get('/api/providers/:id', providers.read);
  app.post('/api/providers', providers.create);
  app.put('/api/providers/:id', providers.update);
  app.delete('/api/providers/:id', providers.delete);

  return providers;
};
