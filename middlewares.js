const isLoggedIn = (req, res, next) => {
  const requestedUser = req.originalUrl;

  if (!req.isAuthenticated()) {
    return res.redirect(`${requestedUser}/login`);
  }

  next();
};

const isLoggedOut = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('back');
  }

  next();
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    req.flash('error', 'Unauthorized');

    return res.render('unauthorized', { messages: req.flash(), role: 'user' });
  }

  next();
};

const isUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    req.flash('error', 'Unauthorized');

    return res.render('unauthorized', { messages: req.flash(), role: 'admin' });
  }

  next();
};

module.exports = { isLoggedIn, isLoggedOut, isAdmin, isUser };
