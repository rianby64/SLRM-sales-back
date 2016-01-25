
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
    var search = { $or: { }};
    if (req.query) {
      if ((req.query.search) && (req.query.search.length > 0)) {
        for (var attr in Model.attributes) {
          if (attr === 'id') continue;
          search.$or[attr] = sequelize.where(sequelize.cast(sequelize.col(attr), 'text'), { $ilike: '%' + req.query.search + '%' });
        }
      }
    }
    orderform.test(req, res).then(function() {
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
