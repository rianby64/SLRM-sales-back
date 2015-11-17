
module.exports = function (sequelize, app, multipartMiddleware) {

  var Sequelize = require('sequelize'),
      tableAPI = require('../tableAPI.js');

  var Users = sequelize.define('users', {
    uuid: Sequelize.TEXT,
    name: Sequelize.TEXT,
    email: Sequelize.TEXT,
    telephone: Sequelize.TEXT,
    group: Sequelize.TEXT,
    comments: Sequelize.TEXT
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  var users = tableAPI.setup(Users, sequelize);
  
  app.post('/api/users/upload', multipartMiddleware, users.upload);
  app.get('/api/users', users.list);
  app.get('/api/users/:id', users.read);
  app.post('/api/users', users.create);
  app.put('/api/users/:id', users.update);
  app.delete('/api/users/:id', users.delete);

  return users;
};
