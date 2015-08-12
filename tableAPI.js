"use strict";

function setup(Model) {
  return {
    model: Model,
    list: function (req, res) {
      return Model.findAll().then(function(entries) {
        res.json(entries);
      });
    },
    create: function (req, res) {
      var neItem = req.body;
      return Model.create(neItem).then(function(entry) {
        res.json(entry);
      });      
    },
    read: function (req, res) {
      var id = ~~req.params.id;
      return Model.findOne({ where: {id: id} }).then(function(entry) {
          res.json(entry);
      });
    },
    update: function (req, res) {
      var id = ~~req.params.id;
      var updateData = req.body;

      return Model.update(updateData, {
        where: {
          id: id
        }
      }).then(function(entry) {
        res.json(updateData); // ????
      });
    },
    delete: function (req, res) {
      var id = ~~req.params.id
      return Model.destroy({
        where: {
          id: id
        }
      }).then(function() {
        res.json({});
      });
    },
    upload: function (req, res) {
      var oldPath = req.files.file.path;
      var dir = './uploaded/';
      var newPath = dir + req.files.file.name;

      if (!f.existsSync(dir)) {
        f.mkdirSync(dir);
      }

      f.readFile(oldPath , function(err, data) {
        f.writeFile(newPath, data, function(err) {
          f.unlink(oldPath, function(){
            if(err) { res.json({ 'status': 'err' }); return; };
            res.send("File uploaded to: " + newPath);
          });
        }); 
      });
    }
  };
}


module.exports = {
  setup: setup
};