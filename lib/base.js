var async = require('async'),
    db_helper = require('./connection');


var Saveable = function() {

  this.beforeSaveFn = function () {};
  this.afterSaveFn = function () {};

  this.save = function (cb) {
    var self = this,
        db = db_helper.connection();


    if (!cb) {
      cb = function () {};
    }
   
    // this needs to be improved. It shouldn't know about runValidate
    if (!self.runValidate(cb)) { return; }

    self.dateCreated = self.dateCreated || new Date();
    self.lastUpdated = new Date();

    var id = self.id || self._id;

    self.beforeSaveFn && self.beforeSaveFn(self);

      var item = self.serialise();

      db.save(id,item, function (err, res) {
        if (err) {
          dumpError(err); 
          return cb(err, null);
        }

        self.id = res.id || res._id;
        self.rev = res.rev;
        
        self.afterSaveFn && self.afterSaveFn(self)

        cb(null, self);
      });
  };
};

var Removeable = function () {

  this.beforeRemoveFn = function () {};
  this.afterRemoveFn = function () {};

  this.remove = function (cb) {
    var self = this,
        db = db_helper.connection();

    self.beforeRemoveFn && self.beforeRemoveFn(self);

    try {
      if (!self.rev) {
        return cb({message: "rev needs to be supplied"});
      }

      db.remove(self.id,self.rev, function (err, res) {
        if (err) {
          return cb(err);
        }

        self.afterRemoveFn && self.afterRemoveFn(self)

        return cb(null);
      });
    } catch(ex) {
      cb(ex);
    };
  };


};



function dumpError(err) {
  if (typeof err === 'object') {
    if (err.message) {
      console.dir('\nMessage: ' + err.message)
    }
    if (err.stack) {
      console.dir('\nStacktrace:')
        console.dir('====================')
        console.dir(err.stack);
    }

    if (err.error) {
      //console.dir(err);
    }
  } else {
    console.dir('dumpError :: argument is not an object');
  }
}

module.exports.Saveable = Saveable;
module.exports.Removeable = Removeable;


