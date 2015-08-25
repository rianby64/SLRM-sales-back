
module.exports = function (sequelize, app, multipartMiddleware, opts) {

  var Sequelize = require('sequelize'),
      tableAPI = require('../tableAPI.js');
  
  var CommpropGoods = sequelize.define('commercial_proposal_goods', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    price: Sequelize.INTEGER,
    quantity: Sequelize.INTEGER,
    comments: Sequelize.TEXT
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  CommpropGoods.belongsTo(opts.Commprop);
  CommpropGoods.belongsTo(opts.Goods);
  
  var commpropgoods = tableAPI.setup(CommpropGoods);
  
  app.post('/api/commprop/:commercialProposalId/goods/upload', multipartMiddleware, commpropgoods.upload);
  app.get('/api/commprop/:commercialProposalId/goods', function (req, res) {
    var commercialProposalId = ~~req.params.commercialProposalId;
    return CommpropGoods.findAll({
      where: {
        commercialProposalId: commercialProposalId
      },
      include: [{
        model: opts.Goods,
        include: [{
          model: opts.Providers
        }]
      }, {
        model: opts.Commprop
      }]
    }).then(function(entries) {
      res.json(entries);
    });
  });
  app.get('/api/commprop/:commercialProposalId/goods/:id', commpropgoods.read);
  app.put('/api/commprop/:commercialProposalId/goods/:id', commpropgoods.update);
  app.post('/api/commprop/:commercialProposalId/goods', commpropgoods.create);
  app.delete('/api/commprop/:commercialProposalId/goods/:id', commpropgoods.delete);
  
  return commpropgoods;
};