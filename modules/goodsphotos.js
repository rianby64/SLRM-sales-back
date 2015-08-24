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
  
  var goodsphotos = tableAPI.setup(GoodsPhotos);
  
  app.post('/api/goods/:goodId/photos/upload', multipartMiddleware, function (req, res) {
    var oldPath = req.files.file.path,
        dir1 = './static',
        dir2 = dir1 + '/uploaded',
        dir = dir2 + '/goodsphotos',
        newPath = dir + '/' + req.files.file.name,
        goodId = ~~req.params.goodId;

    
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
            maxHeight: 100,
            maxWidth: 100
          },{
            suffix: '-square',
            maxHeight: 300,
            maxWidth: 300
          }]
        };

        resize(image, output, function(error, versions) {
          if (error) { console.error(error); }
          
//          console.log(versions[0].path);   // /path/to/image-thumb.jpg 
//          console.log(versions[0].width);  // 150 
//          console.log(versions[0].height); // 100 
//
//          console.log(versions[1].path);   // /path/to/image-square.jpg 
//          console.log(versions[1].width);  // 200 
//          console.log(versions[1].height); // 200 
          
          
          fs.unlink(oldPath, function(){
            if (err) { 
              res.json({
                success: false
              });
              return;
            }
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