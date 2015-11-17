
module.exports = function (sequelize, app, multipartMiddleware, opts) {

  var Sequelize = require('sequelize'),
      tableAPI = require('../tableAPI.js');

  var Commprop = sequelize.define('commercial_proposal', {
    comments: Sequelize.TEXT,
    sent_date: Sequelize.DATE,
    alert_date: Sequelize.DATE,
    status: Sequelize.TEXT,
    author: Sequelize.TEXT
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  var commprop = tableAPI.setup(Commprop, sequelize);
  Commprop.belongsTo(opts.Client);
  Commprop.belongsTo(opts.Broker);
  
  app.post('/api/commprop/upload', multipartMiddleware, commprop.upload);
  app.get('/api/commprop', function (req, res) {
    
    var search = { $or: {}},
        attributes = [
          'commercial_proposal.id',
          'client.first_name',
          'client.middle_name',
          'client.last_name',
          'client.passport',
          'client.telephone',
          'client.address',
          'client.email',
          'client.comments',
          'broker.first_name',
          'broker.middle_name',
          'broker.last_name',
          'broker.passport',
          'broker.telephone',
          'broker.address',
          'broker.email',
          'broker.type',
          'broker.organization_name',
          'broker.legal_name',
          'broker.inn',
          'broker.requeriments',
          'broker.comments'
        ];
    if (req.query) {
      if ((req.query.search) && (req.query.search.length > 0)) {
        attributes.forEach(function(attr) {
          search.$or[attr] = sequelize.where(sequelize.cast(sequelize.col(attr), 'text'), { $ilike: '%' + req.query.search + '%' });
        });
      }
    }
    
    
    return Commprop.findAll({
      include: [
        {
          model: opts.Client
        }, 
        {
          model: opts.Broker
        }
      ],
      where: search
    }).then(function(entries) {
      res.json(entries);
    });
  });
  app.get('/api/commprop/:id', function (req, res) {
    var id = ~~req.params.id;
    return Commprop.findOne({
      where: {id: id},
      include: [
        {
          model: opts.Client
        },
        {
          model: opts.Broker
        }
      ]
    }).then(function(entry) {
        res.json(entry);
    });
  });
  app.post('/api/commprop', function (req, res) {
    var neItem = req.body;
    return Commprop.create(neItem).then(function(created) {
      return Commprop.findOne({
        where: {id: created.id},
        include: [
          {
            model: opts.Client
          },
          {
            model: opts.Broker
          }
        ]
      }).then(function(entry) {
          res.json(entry);
      });
    });      
  });
  app.put('/api/commprop/:id', commprop.update);
  app.delete('/api/commprop/:id', commprop.delete);

  return commprop;
};
