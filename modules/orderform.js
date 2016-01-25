
module.exports = function (sequelize, app, multipartMiddleware, opts) {

  var Sequelize = require('sequelize'),
      tableAPI = require('../tableAPI.js');

  var Commprop = opts.Commprop;
  var OrderForm = sequelize.define('order_form', {
    comments: Sequelize.TEXT,
    discount: Sequelize.FLOAT,
    prepayment: Sequelize.FLOAT,
    status: Sequelize.TEXT,
    author: Sequelize.TEXT
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  OrderForm.belongsTo(Commprop);
  OrderForm.belongsTo(opts.CommpropVariants);
  Commprop.hasOne(OrderForm);
  var orderform = tableAPI.setup(OrderForm, sequelize);

  orderform.test = function test(req, res) {
    return Commprop.findAll({
      where: {
        status: 'ok',
        '$order_form.commercialProposalId$': { $eq: null }
      },
      include: [{
        model: OrderForm,
        required: false
      }]
    }).then(function(response) {
      var author = req.query.author,
          toAdd = [];
      response.forEach(function(item) {
        toAdd.push({
          commercialProposalId: item.id,
          author: author,
          status: '-'
        });
      });
      
      return OrderForm.bulkCreate(toAdd);
    });
  };
  
  app.post('/api/orderform/upload', multipartMiddleware, orderform.upload);
  app.get('/api/orderform', function (req, res) {
    return orderform.test(req, res).then(function() {
      var search = { $or: { } },
          attributes = [
            "order_form.id",
            "order_form.comments",
            "order_form.discount",
            "order_form.prepayment",
            "order_form.status",
            "order_form.author",
            "order_form.commercialProposalId",
            "commercial_proposal.comments",
            "commercial_proposal.sent_date",
            "commercial_proposal.alert_date",
            "commercial_proposal.status",
            "commercial_proposal.author",
            "commercial_proposal.client.first_name",
            "commercial_proposal.client.middle_name",
            "commercial_proposal.client.last_name",
            "commercial_proposal.client.birth_date",
            "commercial_proposal.client.passport",
            "commercial_proposal.client.telephone",
            "commercial_proposal.client.address",
            "commercial_proposal.client.email",
            "commercial_proposal.client.comments",
            "commercial_proposal.broker.first_name",
            "commercial_proposal.broker.middle_name",
            "commercial_proposal.broker.last_name",
            "commercial_proposal.broker.birth_date",
            "commercial_proposal.broker.passport",
            "commercial_proposal.broker.telephone",
            "commercial_proposal.broker.address",
            "commercial_proposal.broker.email",
            "commercial_proposal.broker.type",
            "commercial_proposal.broker.organization_name",
            "commercial_proposal.broker.legal_name",
            "commercial_proposal.broker.inn",
            "commercial_proposal.broker.requeriments",
            "commercial_proposal.broker.comments",
            "commercial_proposal_variant.name",
            "commercial_proposal_variant.comments"
          ];
      if (req.query) {
        if ((req.query.search) && (req.query.search.length > 0)) {
          attributes.forEach(function(attr) {
            search.$or[attr] = sequelize.where(sequelize.cast(sequelize.col(attr), 'text'), { $ilike: '%' + req.query.search + '%' });
          });
        }
      }
      return OrderForm.findAll({
        where: search,
        include: [{
          model: Commprop,
          include: [{
            model: opts.Client
          }, {
            model: opts.Broker
          }]
        },{
          model: opts.CommpropVariants
        }]
      }).then(function(entries) {
        res.json(entries);
      });
    });
  });
  app.get('/api/orderform/:id', function (req, res) {
    var id = ~~req.params.id;
    return OrderForm.findOne({
      where: { id: id },
      include: [{
        model: Commprop,
        include: [{
          model: opts.Client
        }, {
          model: opts.Broker
        }]
      }, {
        model: opts.CommpropVariants
      }]
    }).then(function(entry) {
      res.json(entry);
    });
  });
  app.post('/api/orderform', orderform.create);
  app.put('/api/orderform/:id', orderform.update);
  app.delete('/api/orderform/:id', orderform.delete);
  
  return orderform;
};
