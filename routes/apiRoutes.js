var db = require("../models");
var passport = require("../config/passport");
var path = require("path");
var axios = require("axios");
var Sequelize = require("sequelize");

let Op = Sequelize.Op;

// Requiring our custom middleware for checking if a user is logged in
var isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function(app) {

  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  console.log("routes fire")
  app.post("/api/login", passport.authenticate("local"), function (req, res) {
    res.json(req.user);
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", function (req, res) {
    console.log(req.body)
    console.log(req.body.password)
    db.User.create({
      username: req.body.userName,
      email: req.body.email,
      password: req.body.password
    })
      .then(function () {
        res.redirect(307, "/api/login");
      })
      .catch(function (err) {
        res.status(401).json(err);
      });
  });

  // Route for logging user out
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function (req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id
      });
    }
  });

  //Search function for movies that might match the search

  app.get("/api/movie/:title", function(req, res) {
         //  res.send("parameter: " + req.params.title)
            console.log("route hit");
    var movie = req.params.title

    console.log(movie)
    db.movies.findAll({
      where: {
          title: { [Op.like]: "%" + movie + "%"}
      }
    }).then(function (data) {
      res.json(data);
      console.log(data)
    })
  })

  app.post("/api/comment", function (req, res) {
    db.discussion.create({
      username: req.body.username,
      text: req.body.text,
      parent_id: req.body.parent_id,
      art_id: req.body.art_id,
      art_category: req.body.art_category
    }).then(function(data){
      res.json({is_successful: true})
    })
  })

  app.put("/api/comment", function(req, res){
    db.discussion.update({text: req.body.text}, {where:{
      id: req.body.id
    }
    }).then(function(data){
      res.json({is_successful: true})
    })
  })

  app.delete("/api/comment/:id", function(req, res){
    db.discussion.destroy({
      where: {
        id: req.params.id
      }
    }).then(function(data){
      res.json({is_successful: true})
    })
  })
};