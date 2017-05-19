var assert = require('assert'),
    cradle = require('cradle'),
    Model = require('../lib/index'),
    db = require('./spec_helper').db;

describe("Saving Item", function () {
  before(function (done) {

    Model.define('User', {
      //  id: String,
      name: String,
      surname: String,
    });

    Model.load(function () { done(); });
  })

  it("Should save item into db", function (done) {

    var user = Model('User').create({
      _id : "EddieVedder",
      name : "Eddie",
      surname : "Vedder"
    });

    user.save(function (err, result) {
      if (err) throw err;

      user.id.should.equal("EddieVedder");

      db.get(user.id, function (err, loaded_user) {
        loaded_user.name.should.equal(user.name);
        loaded_user.surname.should.equal(user.surname);
        done();
      });

    });
  })

  it("Should create id for model if not defined", function (done) {
    Model.define('User_no_id', {
      name: String,
      surname: String,
    });

    var user = Model('User_no_id').create({name: "John", surname: "Rambo"});

    user.save(function (err, user_loaded) {
      assert.notEqual( user_loaded.id, undefined);
      user_loaded.name.should.equal(user.name);
      done();
    });


  })

  it("Should have a model type", function (done) {
    var user = Model('User').create({
      _id : "Jimmy",
      name : "Jimmy",
      surname : "Page"
    });

    user.id.should.equal("Jimmy");
    user.model_type.should.equal("User");

    user.save(function (err, result) {
      if (err) {
        console.dir(err);
        throw err;      
      }

      db.get(user.id, function (err, loaded_user) {
        loaded_user.model_type.should.equal("User");
        done();
      });

    });
  })

  it("Should have a created date", function (done) {

    var user = Model('User').create({
      _id : "Jimi",
      name : "Jimi",
      surname : "Hendrix"
    });

    user.save(function (err, result) {
      if (err) throw err;

      db.get(user.id, function (err, loaded_user) {
        var dateCreated = new Date(loaded_user.dateCreated);
        var current_time = new Date();
        dateCreated.getMinutes().should.equal(current_time.getMinutes());
        dateCreated.getHours().should.equal(current_time.getHours());
        done();
      });

    });

  })

  it("Should return a json version of model", function () {
    var user = Model('User').create({
      _id : "Jimi",
      name : "Jimi",
      surname : "Hendrix"
    });

    var attr = { 
      model_type: 'User',
      id: 'Jimi',
      name: 'Jimi',
      surname: 'Hendrix',

      dateCreated: undefined,
      lastUpdated: undefined,
    };

    user.toJSON().should.deepEqual(attr);
  })
});

