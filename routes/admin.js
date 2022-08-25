const express = require('express');
const passport = require('passport');
const router = express.Router();
const path = require('path');

const {
  isLoggedIn,
  isLoggedOut,
  isAdmin,
  isUser,
} = require('./../middlewares');
const User = require('./../models/user');
const Product = require('./../models/product');

// Storage
const multer = require('multer');
const Order = require('../models/order');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Route for admin signup page
router.get('/signup', isLoggedOut, (req, res) => {
  res.render('admin/signup', { messages: req.flash() });
});

// Routes for admin signup POST
router.post('/signup', async (req, res) => {
  try {
    const user = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
      role: 'admin',
    };

    const newUser = await User.register(user, req.body.password);

    req.flash('success', 'User registered successfully');

    res.redirect('/admin/signup');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/admin/signup');
  }
});

// Route for admin login page
router.get('/login', isLoggedOut, (req, res) => {
  res.render('admin/login', { messages: req.flash() });
});

// Route for login POST
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/admin/login',
  }),
  (req, res) => {}
);

// Route for admin logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/admin/login');
  });
});

// Route for admin home
router.get('/', isLoggedIn, isAdmin, (req, res) => {
  return res.redirect('/admin/view');
});

// Route for admin add page
router.get('/add', isLoggedIn, isAdmin, (req, res) => {
  res.render('admin/add', { messages: req.flash() });
});

// Route for admin add POST
router.post(
  '/add',
  isLoggedIn,
  isAdmin,
  upload.single('productImage'),
  async (req, res) => {
    try {
      const product = new Product({
        productName: req.body.productName,
        sku: req.body.sku,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        productImage: req.file ? `/uploads/${req.file.filename}` : null,
      });

      const newProduct = await product.save();

      req.flash('success', 'Product added successfully');

      res.redirect('/admin/add');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/admin/add');
    }
  }
);

// Route for admin view page
router.get('/view', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const products = await Product.find();

    req.flash('success', 'Products fetched successfully');

    return res.render('admin/view', { messages: req.flash(), products });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/admin');
  }
});

// Route for admin edit page
router.get('/edit/:id', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    res.render('admin/edit', { messages: req.flash(), product });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/admin');
  }
});

// Route for admin edit POST
router.post(
  '/edit/:id',
  isLoggedIn,
  isAdmin,
  upload.single('productImage'),
  async (req, res) => {
    try {
      const product = {
        productName: req.body.productName,
        sku: req.body.sku,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        productImage: `/uploads/${req.file.filename}`,
      };

      await Product.findByIdAndUpdate(req.params.id, product);

      req.flash('success', 'Product edited successfully');

      res.redirect('/admin/view');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/admin/view');
    }
  }
);

// Route for admin delete GET
router.get('/delete/:id', isLoggedIn, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    req.flash('success', 'Product deleted successfully');

    res.redirect('/admin/view');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/admin/view');
  }
});

router.get('/orders/pending', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate('uid orders.products.pid');

    orders.map((customer) => {
      const pendingOrders = customer.orders.filter(
        (order) => order.status === 'processing'
      );

      customer.orders = pendingOrders;

      return customer;
    });

    req.flash('success', 'Orders fetched successfully');

    res.render('admin/orders', {
      messages: req.flash(),
      customerOrders: orders,
    });
  } catch (err) {
    req.flash('error', err.message);
    return res.redirect('/admin');
  }
});

router.get('/orders/completed', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate('uid orders.products.pid');

    orders.map((customer) => {
      const deliveredOrders = customer.orders.filter(
        (order) => order.status === 'delivered'
      );

      customer.orders = deliveredOrders;

      return customer;
    });

    req.flash('success', 'Orders fetched successfully');

    res.render('admin/orders', {
      messages: req.flash(),
      customerOrders: orders,
    });
  } catch (err) {
    req.flash('error', err.message);
    return res.redirect('/admin');
  }
});

router.get(
  '/orders/deliver/:userId/:orderId',
  isLoggedIn,
  isAdmin,
  async (req, res) => {
    try {
      const customerOrders = await Order.findOne({
        uid: req.params.userId,
      }).populate('uid orders.products.pid');

      customerOrders.orders.map((order) => {
        if (order._id == req.params.orderId) {
          order.status = 'delivered';
        }

        return order;
      });

      await Order.findOneAndUpdate({ uid: req.params.userId }, customerOrders);

      req.flash('success', 'Orders fetched successfully');

      res.redirect('back');
    } catch (err) {
      req.flash('error', err.message);
      return res.redirect('/admin');
    }
  }
);

module.exports = router;
