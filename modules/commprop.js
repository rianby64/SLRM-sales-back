
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

  var commprop = tableAPI.setup(Commprop);
  Commprop.belongsTo(opts.Client);
  Commprop.belongsTo(opts.Broker);
  
  app.post('/api/commprop/upload', multipartMiddleware, commprop.upload);
  app.get('/api/commprop', function (req, res) {
    return Commprop.findAll({
      include: [
        {
          model: opts.Client
        }, 
        {
          model: opts.Broker
        }
      ]
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
