
module.exports = function (sequelize, app, multipartMiddleware, opts) {

  var Sequelize = require('sequelize'),
      tableAPI = require('../tableAPI.js');
  
  var GoodsProviders = sequelize.define('goods_providers', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    currency: Sequelize.TEXT,
    price: Sequelize.INTEGER
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  GoodsProviders.belongsTo(opts.Providers);
  GoodsProviders.belongsTo(opts.Goods);
  
  var goodsproviders = tableAPI.setup(GoodsProviders, sequelize);
  
  app.post('/api/goods/:goodId/providers/upload', multipartMiddleware, goodsproviders.upload);
  app.get('/api/goods/:goodId/providers', function (req, res) {
    var goodId = ~~req.params.goodId;
    return GoodsProviders.findAll({
      where: {
        goodId: goodId
      },
      include: [{
        model: opts.Goods
      }, {
        model: opts.Providers
      }]
    }).then(function(entries) {
      res.json(entries);
    });
  });
  app.get('/api/goods/:goodId/providers/:id', goodsproviders.read);
  app.put('/api/goods/:goodId/providers/:id', goodsproviders.update);
  app.post('/api/goods/:goodId/providers', goodsproviders.create);
  app.delete('/api/goods/:goodId/providers/:id', goodsproviders.delete);
  
  return goodsproviders;
};