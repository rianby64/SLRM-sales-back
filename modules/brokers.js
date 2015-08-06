
module.exports = function (sequelize, app, multipartMiddleware) {

  var Sequelize = require('sequelize'),
      tableAPI = require('../tableAPI.js');

  var Brokers = sequelize.define('brokers', {
    first_name: Sequelize.TEXT,
    middle_name: Sequelize.TEXT,
    last_name: Sequelize.TEXT,
    birth_date: Sequelize.DATE,
    passport: Sequelize.TEXT,
    
    telephone: Sequelize.TEXT,
    address: Sequelize.TEXT,
    email: Sequelize.TEXT,
    
    type: Sequelize.TEXT,
    
    organization_name: Sequelize.TEXT,
    legal_name: Sequelize.TEXT,
    inn: Sequelize.INTEGER,
    requeriments: Sequelize.TEXT,
    
    comments: Sequelize.TEXT
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  Brokers.sync();
  
  var brokers = tableAPI.setup(Brokers);
  
  app.post('/api/brokers/upload', multipartMiddleware, brokers.upload);
  app.get('/api/brokers', brokers.list);
  app.get('/api/brokers/:id', brokers.read);
  app.post('/api/brokers', brokers.create);
  app.put('/api/brokers/:id', brokers.update);
  app.delete('/api/brokers/:id', brokers.delete);

  return brokers;
};
