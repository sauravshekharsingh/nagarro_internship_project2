const express = require('express');
const passport = require('passport');
const router = express.Router();

const { isLoggedOut } = require('../middlewares');
const User = require('./../models/user');

// Route for signup page
router.get('/signup', isLoggedOut, (req, res) => {
  res.render('auth/signup', { messages: req.flash() });
});

// Routes for signup POST
router.post('/signup', async (req, res) => {
  try {
    const user = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
      role: 'user',
    };

    const newUser = await User.register(user, req.body.password);

    req.flash('success', 'User registered successfully');

    res.redirect('/signup');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/signup');
  }
});

// Route for login page
router.get('/login', isLoggedOut, (req, res) => {
  res.render('auth/login', { messages: req.flash() });
});

// Route for login POST
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/user',
    failureRedirect: '/login',
  }),
  (req, res) => {}
);

// Route for logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/login');
  });
});

module.exports = router;
