var createError = require('http-errors');
var express = require('express');
require("dotenv").config();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const mongoose = require("mongoose");

const mongoDb = process.env.MONGODB_URI;
mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const User = require("./models/user");

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { errorMessage: "Incorrect username" });
      };
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { errorMessage: "Incorrect password" })
      };
      return done(null, user);
    } catch(err) {
      return done(err);
    };
  })
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

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
