
module.exports = function (sequelize, app, multipartMiddleware) {

  var Sequelize = require('sequelize'),
      tableAPI = require('../tableAPI.js');

  var Clients = sequelize.define('clients', {
    first_name: Sequelize.TEXT,
    middle_name: Sequelize.TEXT,
    last_name: Sequelize.TEXT,
    birth_date: Sequelize.DATE,
    passport: Sequelize.TEXT,
    
    telephone: Sequelize.TEXT,
    address: Sequelize.TEXT,
    email: Sequelize.TEXT,
    
    comments: Sequelize.TEXT
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  Clients.sync();
  
  var clients = tableAPI.setup(Clients);
  
  app.post('/api/clients/upload', multipartMiddleware, clients.upload);
  app.get('/api/clients', clients.list);
  app.get('/api/clients/:id', clients.read);
  app.post('/api/clients', clients.create);
  app.put('/api/clients/:id', clients.update);
  app.delete('/api/clients/:id', clients.delete);

  return clients;
};
