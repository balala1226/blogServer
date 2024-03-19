var createError = require('http-errors');
var express = require('express');
require("dotenv").config();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const passportJWT = require('passport-jwt');
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const cors = require('cors');

const mongoose = require("mongoose");

const mongoDb = process.env.MONGODB_URI;
mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

var app = express();

let corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:5173'],
  optionsSuccessStatus: 200
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.options('*', cors(corsOptions));

const User = require("./models/user");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { 
          message: 'Incorrect Username or Username does not exist'
        });
      };
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { 
          message: "Incorrect password" 
        })
      };
      return done(null, user);
    } catch(err) {
      return done(err);
    };
  })
);

passport.use(
  new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_KEY
  },
  async (token, done) => {
    try {
      console.log(token)
      return done(null, token.user)
    } catch(error){
      return done(error)
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
      const user = await User.findById(id);
      done(null, user);
  } catch(err) {
      done(err);
  };
});

app.use('/', indexRouter);
app.use('/api', cors(corsOptions), apiRouter);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).json({
    err
  });
});

module.exports = app;
