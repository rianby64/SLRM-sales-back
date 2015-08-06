
module.exports = function (sequelize, app, multipartMiddleware) {

  var Sequelize = require('sequelize'),
      tableAPI = require('../tableAPI.js');

  var Auth = sequelize.define('auth', {
    name: Sequelize.TEXT
  }, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  Auth.sync();
  
  var auth = tableAPI.setup(Auth);
  
  // RE-WRITE authCreate POST:/auth
  function authCreate(req, res) {
    var neItem = req.body;
    res.json({ success: true });
  }
  
  app.post('/api/auth/upload', multipartMiddleware, auth.upload);
  app.get('/api/auth', auth.list);
  app.get('/api/auth/:id', auth.read);
  app.post('/api/auth', authCreate);
  app.put('/api/auth/:id', auth.update);
  app.delete('/api/auth/:id', auth.delete);

  return auth;
};
