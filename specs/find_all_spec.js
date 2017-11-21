var db = require('./spec_helper').db,
    Model = require('../lib/index'),
    db_helper = require('../lib/connection');

describe("Getting all models", function () {
  before(function (done) {
    var Blog = Model.define("Blog1", { title: String, content: String });
    var User = Model.define("User", { name: String, surname: String });

    var Comment = Model.define("Comment", {
      name: String,
      text: String
    });

    var Blog2 = Model.define("Blog2", {
      title: String,
      content: String,

      comments: { has_many: Comment }
    }, {
      enableShallowLoading: true
    });

    Model.load(function () {

      Blog.create({title:"First Blog", content:"This is my first blog post"}).save(function (){
        Blog.create({title:"Second Blog post",content:"This is my second blog post"}).save(function () {
          
          var blog_post = Blog2.create({
            title: "Cool blog Post",

            comments: [
              Comment.create({ name:"Garren", text: "Nicely done" }),
              Comment.create({ name:"Billy", text: "What the hell? this doesn't make sense" })
            ]
          });

          blog_post.save(function () {
            done();
          });
        });

      });

    });

  })

  it("Should return all documents for Model", function (done) {
    var Blog = Model("Blog1");

    Blog.all(function(err, blogs) {
      blogs.length.should.equal(2);
      done();
    });
  })

  it("Should only find documents related to model", function (done) {
    var Blog = Model("Blog1");
    var User = Model("User");

    Model.load();

    User.create({name:"Ben", surname:"Harper"}).save(function (){

      Blog.all(function(err, blogs) {
        blogs.length.should.equal(2);
        done();
      });

    });
  });

  it("Should not support shallow queries if not enabled", function (done) {
    var Blog = Model("Blog1");

    Blog.all({ shallow: true }, function(err, users) {
        err.should.not.equal(null);
        done();
    });
  });


  it("Should support shallow queries when enabled", function (done) {
    var Blog = Model("Blog2");

    Blog.all({ shallow: true }, function(err, blogs) {
        blogs.length.should.equal(1);
        blogs[0].comments.length.should.equal(0);

        done();
    });
  });

  it("Should still support deep queries", function (done) {
    var Blog = Model("Blog2");

    Blog.all(function(err, blogs) {
        blogs.length.should.equal(1);
        blogs[0].comments.length.should.equal(2);

        done();
    });
  });
});
