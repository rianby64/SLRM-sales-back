
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

  var providers = tableAPI.setup(Providers);
  
  app.post('/api/providers/upload', multipartMiddleware, providers.upload);
  app.get('/api/providers', providers.list);
  app.get('/api/providers/:id', providers.read);
  app.post('/api/providers', providers.create);
  app.put('/api/providers/:id', providers.update);
  app.delete('/api/providers/:id', providers.delete);

  return providers;
};
