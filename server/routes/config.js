var passport = require('passport');
var path = require('path');
var google = require(path.join(__dirname + '/../google.js'));
var util = require('util');
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
var cookieParser = require('cookie-parser');
var session = require('express-session');
var db = require('../config/init.js')



module.exports = function(app, express){

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cookieParser());
  app.use(session({
    secret: 'fun party fun',
    resave: false,
    saveUninitialized: false
  }));

  // for sessions
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });
   
  passport.use(new GoogleStrategy({
      clientID:     google.GOOGLE_CLIENT_ID,
      clientSecret: google.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/googlecallback",
      passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {  
      db.User.findOrCreate({where: { googleId: profile.id.toString()}, defaults: { name: profile.displayName}}).then(function (user, created) {
        return done(null, user);
      });
    }
  ));

  app.get('/auth/google', passport.authenticate('google', { scope: [
       'https://www.googleapis.com/auth/plus.login',
       'https://www.googleapis.com/auth/plus.profile.emails.read'] 
  }));



  app.get('/googlecallback', 
      passport.authenticate('google', { successRedirect: 'http://localhost:3000/'} )
  );

  app.get('/profile', function(req, res){
    if(req.isAuthenticated()){
      console.log('AUTH EDDDDDD', req.user);
      res.redirect('http://localhost:3000/')
    }
  });

};






