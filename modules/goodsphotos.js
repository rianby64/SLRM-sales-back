"use strict";

var fs = require('fs'), resize = require('im-resize');
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

  var goodsphotos = tableAPI.setup(GoodsPhotos, sequelize);

  app.post('/api/goods/:goodId/photos/upload', multipartMiddleware, function (req, res) {
    var oldPath = req.files.file.path,
        dir1 = './static',
        dir2 = dir1 + '/uploaded',
        dir = dir2 + '/goodsphotos',
        file_extension_regexp = /.*(\.?png|gif|.?jp.?g)$/i,
        newFilename = (new Date()).toISOString().replace(/-/g, '').replace(/:/g, '').replace(/\./g, ''),
        newPath = dir + '/' + newFilename + '.' + req.files.file.name.match(file_extension_regexp)[1],
        goodId = ~~req.params.goodId;

    if (!file_extension_regexp.test(newPath)) {
      res.status(404);
      return;
    }

    if (!fs.existsSync(dir2)) {
      fs.mkdirSync(dir2);
    }
    if (!fs.existsSync(dir1)) {
      fs.mkdirSync(dir1);
    }
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    fs.readFile(oldPath, function(err, data) {
      fs.writeFile(newPath, data, function(err) {

        var image = {
          path: newPath
        };

        var output = {
          versions: [{
            suffix: '-thumb',
            maxHeight: 200,
            maxWidth: 200
          },{
            suffix: '-square',
            maxHeight: 600,
            maxWidth: 600
          }]
        };

        resize(image, output, function(error, versions) {
          if (error) { res.status(404); console.log(error); }

          if (versions instanceof Array) {
            var t = versions[1];
          }
          if (!t) { res.status(404); console.log(error); }
          fs.unlink(oldPath, function(){
            if (err) {
              res.json({
                success: false
              });
              return;
            }
            if (!versions) { res.status(404); console.log(error); return; }
            if (versions.length === 0) { res.status(404); console.log(error); return; }
            var neItem = {
              goodId: goodId,
              path: versions[1].path
            };
            return GoodsPhotos.create(neItem).then(function(entry) {
              res.json(entry);
            });
          });



        });


      });
    });
  });
  app.get('/api/goods/:goodId/photos', function (req, res) {
    var goodId = ~~req.params.goodId;
    return GoodsPhotos.findAll({
      where: {
        goodId: goodId
      }
    }).then(function(entries) {
      res.json(entries);
    });
  });
  app.get('/api/goods/:goodId/photos/:id', goodsphotos.read);
  app.put('/api/goods/:goodId/photos/:id', goodsphotos.update);
  app.post('/api/goods/:goodId/photos', goodsphotos.create);
  app.delete('/api/goods/:goodId/photos/:id', goodsphotos.delete);

  return goodsphotos;
};
