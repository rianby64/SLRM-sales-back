
module.exports = function (sequelize, app, multipartMiddleware, opts) {

  var Sequelize = require('sequelize'),
      tableAPI = require('../tableAPI.js');

  var CommpropGoods = sequelize.define('commercial_proposal_goods', {
    price: Sequelize.INTEGER,
    currency: Sequelize.TEXT,
    delivery_period: Sequelize.TEXT,
    quantity: Sequelize.INTEGER,
    comments: Sequelize.TEXT
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  CommpropGoods.belongsTo(opts.CommpropVariants);
  CommpropGoods.belongsTo(opts.Goods);

  var commpropgoods = tableAPI.setup(CommpropGoods, sequelize);

  app.post('/api/commpropvariant/:commercialProposalVariantId/goods/upload', multipartMiddleware, commpropgoods.upload);
  app.get( '/api/commpropvariant/:commercialProposalVariantId/goods', function (req, res) {
    var commercialProposalVariantId = ~~req.params.commercialProposalVariantId;
    return CommpropGoods.findAll({
      where: {
        commercialProposalVariantId: commercialProposalVariantId
      },
      include: [{
        model: opts.Commprop,
        include: [{
          model: opts.Goods,
          include: [{
            model: opts.Providers
          }]
        }]
      }, {
        model: opts.CommpropVariants
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
