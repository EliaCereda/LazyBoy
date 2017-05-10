var db = require('./spec_helper').db,
    Model = require('../lib/index'),
    db_helper = require('../lib/connection');


describe("Finding by property", function () {
  before(function (done) {
    Model.define("User", {
      name: { type: String, indexed: true },
      surname: { type: String, indexed: true },
      age: Number
    });

    Model.load(function () {

      var User = Model("User");

      User.create({ name:"Benjamin", surname:"Harper", age: 24 }).save(function (){
        User.create({ name:"Joshua",surname:"James", age: 42 }).save(function () {
          done();
        });

      });
    });

  })

  it("Should create view that can be queried for first names", function (done) {
    var User = Model("User");
    User.where("name","Benjamin",function (err, users) {
      users.length.should.equal(1);
      var user = users[0];
      user.name.should.equal("Benjamin");
      user.surname.should.equal("Harper");
      done();
    });

  })

  it("Should find any existing user by first name", function (done) {
    var User = Model("User");
    User.where("name","Joshua", function (err, users) {
      users.length.should.equal(1);
      var user = users[0];
      user.name.should.equal("Joshua");
      user.surname.should.equal("James");
      done();
    });

  })

  it("Should find first existing user by first name", function (done) {
    var User = Model("User");
    User.whereFirst("name","Joshua", function (err, user) {
      user.name.should.equal("Joshua");
      user.surname.should.equal("James");
      done();
    });
  })

  it("Should return empty array if query not exist", function (done) {
    var User = Model("User");

    User.where("name","Henry", function (err, users) {
      users.length.should.equal(0);
      done();
    });
  })

  it("Should return 'missing_named_view' for properties that are not indexed", function (done) {
    var User = Model("User");

    User.where("age", 24, function (err, users) {
      err.reason.should.equal("missing_named_view");
      done();
    });
  });

  it("Should return 'missing_named_view' view not exist", function (done) {
    var User = Model("User");

    User.where("name123","Henry", function (err, users) {
      err.reason.should.equal("missing_named_view");
      done();
    });
  });

  it("Should query by surname", function (done) {
    var User = Model("User");

    User.where("surname","James",function (err, users) {
      users.length.should.equal(1);
      var user = users[0];
      user.name.should.equal("Joshua");
      user.surname.should.equal("James");
      done();
    });

  });

  it("Should find only for specified model", function (done) {
    var User = Model("User");
    var Another_User = Model.define('AnotherUser',{name:String});
    Model.load();

    Another_User.create({name:"Joshua"}).save(function () {
      User.where("name","Joshua", function (err, users) {
        users.length.should.equal(1);
        users[0].surname.should.equal("James");
        done();
      });
    });
  });

});
