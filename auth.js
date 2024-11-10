const passport = require('passport')
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const GOOGLE_CLIENT_ID = '454559054385-lee6mo4mh4mvdqvfjbp99j45eme8muk2.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = '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'


passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/userpanel",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    
      return done(err, profile);
    }
));

passport.serializeUser(function(req,res){
    done(null,user);
})

passport.deserializeUser(function(req,res){
    done(null,user);
})