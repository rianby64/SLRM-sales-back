
module.exports = function (sequelize, app, multipartMiddleware, opts) {

  var Sequelize = require('sequelize'),
      tableAPI = require('../tableAPI.js');
  
  var GoodsPhotos = sequelize.define('goods_photos', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    path: Sequelize.TEXT
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  GoodsPhotos.belongsTo(opts.Goods);
  
  var goodsphotos = tableAPI.setup(GoodsPhotos);
  
  app.post('/api/goods/:goodId/photos/upload', multipartMiddleware, goodsphotos.upload);
  app.get('/api/goods/:goodId/photos', goodsphotos.list);
  app.get('/api/goods/:goodId/photos/:id', goodsphotos.read);
  app.put('/api/goods/:goodId/photos/:id', goodsphotos.update);
  app.post('/api/goods/:goodId/photos', goodsphotos.create);
  app.delete('/api/goods/:goodId/photos/:id', goodsphotos.delete);
  
  return goodsphotos;
};