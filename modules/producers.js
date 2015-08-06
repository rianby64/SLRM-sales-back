
module.exports = function (sequelize, app, multipartMiddleware) {

  var Sequelize = require('sequelize'),
      tableAPI = require('../tableAPI.js');

  var Producers = sequelize.define('producers', {
    organization_name: Sequelize.TEXT,
    legal_name: Sequelize.TEXT,
    inn: Sequelize.INTEGER,
    requeriments: Sequelize.TEXT,
    
    telephone: Sequelize.TEXT,
    address: Sequelize.TEXT,
    email: Sequelize.TEXT,
    
    comments: Sequelize.TEXT
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  Producers.sync();
  
  var producers = tableAPI.setup(Producers);
  
  app.post('/api/producers/upload', multipartMiddleware, producers.upload);
  app.get('/api/producers', producers.list);
  app.get('/api/producers/:id', producers.read);
  app.post('/api/producers', producers.create);
  app.put('/api/producers/:id', producers.update);
  app.delete('/api/producers/:id', producers.delete);

  return producers;
};
