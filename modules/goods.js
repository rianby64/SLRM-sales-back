
module.exports = function (sequelize, app, multipartMiddleware, belongs) {

  var Sequelize = require('sequelize'),
      tableAPI = require('../tableAPI.js');

  var Goods = sequelize.define('goods', {
    article: Sequelize.TEXT,
    name: Sequelize.TEXT,
    price: Sequelize.FLOAT,
    currency: Sequelize.TEXT,
    description: Sequelize.TEXT,
    
    comments: Sequelize.TEXT
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  Goods.belongsTo(belongs.Categories); 
  Goods.belongsTo(belongs.Producers); 
  Goods.belongsTo(belongs.Providers); 
  Goods.sync();
  
  var goods = tableAPI.setup(Goods);
  
  app.post('/api/goods/upload', multipartMiddleware, goods.upload);
  app.get('/api/goods', goods.list);
  app.get('/api/goods/:id', goods.read);
  app.post('/api/goods', goods.create);
  app.put('/api/goods/:id', goods.update);
  app.delete('/api/goods/:id', goods.delete);

  return goods;
};
