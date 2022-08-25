const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local');
const flash = require('connect-flash');
require('dotenv').config();

// Route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const User = require('./models/user');
const { isLoggedIn, isUser, isLoggedOut } = require('./middlewares');

// Connect to the database
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to the database'))
  .catch((err) => console.log('Error connecting to the database'));

// Set the view engine as EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// Set up path for server to access public files
app.use(express.static(path.join(__dirname, '/public')));
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Express session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: true,
    cookie: { secure: false },
  })
);

// Flash
app.use(flash());

// Passport session
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// To parse the form data
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', isLoggedOut, (req, res) => {
  res.render('role');
});

app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use(authRoutes);

// Server setup
app.listen(process.env.PORT || 8000, () => {
  console.log('Server is up and running on PORT 8000');
});
