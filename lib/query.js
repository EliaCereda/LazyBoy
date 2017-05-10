var db_helper = require('./connection');

var Queriable = function () {

  this.onDocLoad = function (fn) {
    this.onDocLoadFn = fn;
  };

  this.find = function (id, cb) {
    var db = db_helper.connection(),
        self = this;

    db.get(id, function (err, doc) {
      if (err) {
        return cb(err, null);
      }

      if(doc) {
        try {
          var loaded_doc = self.onDocLoadFn(doc);
        } catch(ex) {
          //dumpError(ex);
          return cb(ex,null);
        }
        return cb(null, loaded_doc);
      } else {
        return cb("item does not exist", null);
      }
    });
  };

  this._view = function (view_name, options, cb) {
    var db = db_helper.connection(), 
        self = this;

    db.view(view_name, options, function (err, docs) {
      if (err) {
        return cb(err, null);
      }

      var model_collection = [];

      docs.forEach(function (doc) {
        model_collection.push(self.onDocLoadFn(doc));
      });

      return cb(null, model_collection);
    });
  };

  this.all = function (cb) {

    this._view(this.model_type + '/all', { include_docs: true }, cb);

  };


  this.whereFirst = function (property, key, cb) {

    this.where(property, key, function (err, results) {
      if (err != null) {
        return cb(err, null);
      } else if (results && results.length > 0) {
        return cb(err, results[0]);
      } else {
        return cb("item does not exist", null);
      }
    });

  }; //whereFirst
  

  this.where = function (property, key, cb) {
    var self = this;

    this._view(this.model_type + '/' + property, { key: key, include_docs: true }, function (err, results) {
      if (err != null) {
        if (err.reason == 'missing_named_view') {
          console.error('Query "' + self.model_type + '.' + property + ' == ' + key + '" failed with error "' + err.reason + '".');
          console.error('Did you set "indexed: true" in the schema for ' + self.model_type + '.' + property + '?');
        }

        return cb(err, results);
      } else {
        return cb(err, results);
      }
    });
  };
};

module.exports = Queriable;

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

