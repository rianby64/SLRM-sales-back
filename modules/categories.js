
module.exports = function (sequelize, app, multipartMiddleware) {

  var Sequelize = require('sequelize'),
      tableAPI = require('../tableAPI.js');

  var Categories = sequelize.define('categories', {
    name: Sequelize.TEXT,
    comments: Sequelize.TEXT
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  Categories.sync();
  
  var categories = tableAPI.setup(Categories);
  
  app.post('/api/categories/upload', multipartMiddleware, categories.upload);
  app.get('/api/categories', categories.list);
  app.get('/api/categories/:id', categories.read);
  app.post('/api/categories', categories.create);
  app.put('/api/categories/:id', categories.update);
  app.delete('/api/categories/:id', categories.delete);

  return categories;
};
