var assert = require('assert'),
    async = require('async'),
    cradle = require('cradle'),
    Model = require('../lib/index'),
    db = require('./spec_helper').db;

describe("Saving Multiple Items In Bulk", function () {
  before(function (done) {

    Model.define('User', {
      name: String,
      surname: String,
    });

    Model.define('Blog',{
      title: String,
      url: String
    });

    Model.load(function () { done(); });
  })

  it("Should save items into db", function (done) {
    var User = Model('User');

    var users = [
      User.create({ _id : "EddieVedder2", name : "Eddie", surname : "Vedder" }),
      User.create({ _id : "ElvisPresley2", name : "Elvis", surname : "Presley" })
    ]

    var user_ids = [ "EddieVedder2", "ElvisPresley2" ];

    for (var i = 0; i < users.length; i++) {
      users[i].id.should.equal(user_ids[i]);
    }

    User.bulkSave(users, function (err) {
      if (err) throw err;

      for (var i = 0; i < users.length; i++) {
        users[i].id.should.equal(user_ids[i]);
        assert.notEqual(users[i].rev, undefined);
      }

      async.forEach(users, function (user, done) {
        User.find(user.id, function (err, loaded_user) {
          loaded_user.name.should.equal(user.name);
          loaded_user.surname.should.equal(user.surname);

          done();
        });
      }, done);
    });
  })

  it("Should create id for model if not defined", function (done) {
    var User = Model('User');

    var users = [
      User.create({ name: "John", surname: "Rambo" }),
      User.create({ name: "Samuel", surname: "Trautman" }),
    ];

    User.bulkSave(users, function (err) {
      for (var i = 0; i < users.length; i++) {
        assert.notEqual(users[i].id, undefined);
      }

      done();
    });
  })

  it("Should call beforeSave for every item", function (done) {
    var Blog = Model('Blog');

    Blog.beforeSave(function (post) {
      post.url = post.title.split(' ').join('-');
    });

    var posts = [
      Blog.create({ title: "hello world", post: "My first demo post" }),
      Blog.create({ title: "foo bar", post: "My second demo post" }),
    ];

    Blog.bulkSave(posts, function (err) {
      posts[0].url.should.equal("hello-world");
      posts[1].url.should.equal("foo-bar");

      done();
    });
  })

  it("Should call afterSave for every item", function (done) {
    var Blog = Model('Blog');

    var savedPosts = 0;

    Blog.afterSave(function () {
      savedPosts++;

      if (savedPosts == posts.length)
        done();
    });

    var posts = [
      Blog.create({ title: "hello again", post: "My third demo post" }),
      Blog.create({ title: "bar foo", post: "Yet another demo post" }),
    ];

    Blog.bulkSave(posts);
  })

  it("Should allow updating documents", function (done) {
    var User = Model('User');

    var user = User.create({ _id: "TheGodfather", name: "Marlon", surname: "Brando" });

    User.bulkSave(user, function (err) {
      if (err) throw err;

      user.name = "Don Vito";
      user.surname = "Corleone";

      User.bulkSave(user, function (err) {
        done(err);
      });
    });
  })

  it("Should return an error on conflicts", function (done) {
    var User = Model('User');

    var user1 = User.create({ _id: "TheGodfather2", name: "Marlon", surname: "Brando" });
    var user2 = User.create({ _id: "TheGodfather2", name: "Don Vito", surname: "Corleone" });

    User.bulkSave(user1, function (err) {
      if (err) throw err;

      User.bulkSave(user2, function (err, res) {
        assert.notEqual(err, null);
        res[0].error.should.equal('conflict');

        done();
      })
    });
  })
});

