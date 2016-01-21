
module.exports = function (sequelize, app, multipartMiddleware, opts) {

  var Sequelize = require('sequelize'),
      tableAPI = require('../tableAPI.js');

  var CommpropVariants = sequelize.define('commercial_proposal_variants', {
    name: Sequelize.TEXT,
    comments: Sequelize.TEXT
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  CommpropVariants.belongsTo(opts.Commprop);

  var commpropvariants = tableAPI.setup(CommpropVariants, sequelize);

  app.get('/api/commprop/:commercialProposalId/variants', function (req, res) {
    var commercialProposalId = ~~req.params.commercialProposalId;
    return CommpropVariants.findAll({
      where: {
        commercialProposalId: commercialProposalId
      }
    }).then(function(entries) {
      res.json(entries);
    });
  });
  app.get('/api/commprop/:commercialProposalId/variants/:id', commpropvariants.read);
  app.put('/api/commprop/:commercialProposalId/variants/:id', commpropvariants.update);
  app.post('/api/commprop/:commercialProposalId/variants', commpropvariants.create);
  app.delete('/api/commprop/:commercialProposalId/variants/:id', commpropvariants.delete);

  return commpropvariants;
};
