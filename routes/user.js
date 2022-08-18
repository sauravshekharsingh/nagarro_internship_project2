const express = require('express');
const passport = require('passport');
const router = express.Router();
const path = require('path');

const { isLoggedIn, isLoggedOut, isUser } = require('./../middlewares');
const User = require('./../models/user');
const Product = require('./../models/product');
const { categories } = require('./../utils/constants');
const { toTitleCase } = require('./../utils/text');
const { findById } = require('./../models/user');
const Cart = require('../models/cart');
const Order = require('../models/order');

const getCartCount = (cart) => {
  let cartCount = 0;

  if (cart) {
    cart.products.map((obj) => {
      cartCount += obj.quantity;
    });
  }

  return cartCount;
};

const getCartTotal = (cart) => {
  let cartTotal = 0;

  if (cart && cart.products.length > 0) {
    cart.products.map((obj) => {
      cartTotal += obj.quantity * obj.pid.price;
    });
  }

  return cartTotal;
};

router.get('/', isLoggedIn, isUser, async (req, res) => {
  try {
    const cart = await Cart.findOne({ uid: req.user._id });

    return res.render('user/home', {
      messages: req.flash(),
      categories,
      cartCount: getCartCount(cart),
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/user');
  }
});

router.get('/view', isLoggedIn, isUser, async (req, res) => {
  try {
    const products = await Product.find();
    const cart = await Cart.findOne({ uid: req.user._id });

    req.flash('success', 'Products fetched successfully');

    return res.render('user/view', {
      messages: req.flash(),
      products,
      cartCount: getCartCount(cart),
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/user');
  }
});

router.get('/category/:name', isLoggedIn, isUser, async (req, res) => {
  try {
    const category = req.params.name;

    const products = await Product.find({ category });
    const cart = await Cart.findOne({ uid: req.user._id });

    return res.render('user/view', {
      messages: req.flash(),
      products,
      category: toTitleCase(category),
      cartCount: getCartCount(cart),
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/user');
  }
});

router.get('/product/:id', isLoggedIn, isUser, async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    const cart = await Cart.findOne({ uid: req.user._id });

    return res.render('user/product', {
      messages: req.flash(),
      product,
      cartCount: getCartCount(cart),
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/user');
  }
});

router.get('/cart', isLoggedIn, isUser, async (req, res) => {
  try {
    const cart = await Cart.findOne({ uid: req.user._id }).populate(
      'products.pid'
    );

    req.flash('success', 'Cart fetched successfully');

    res.render('user/cart', {
      messages: req.flash(),
      cart,
      cartCount: getCartCount(cart),
      cartTotal: getCartTotal(cart),
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/user');
  }
});

router.get('/cart/add/:id', isLoggedIn, isUser, async (req, res) => {
  try {
    const productId = req.params.id;

    let cart = await Cart.findOne({ uid: req.user._id });

    if (cart) {
      let productInCart = false;

      cart.products.map((obj) => {
        if (productId == obj.pid) {
          productInCart = true;

          obj.quantity = obj.quantity + 1;

          return obj;
        }
      });

      if (!productInCart) {
        cart.products.push({ pid: productId });
      }
    }

    if (!cart) {
      cart = {
        uid: req.user._id,
        products: [{ pid: productId }],
      };
    }

    await Cart.findOneAndUpdate({ uid: req.user._id }, cart, {
      upsert: true,
    });

    req.flash('success', 'Product added to cart');

    res.redirect('back');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/user');
  }
});

router.get('/cart/increment/:id', isLoggedIn, isUser, async (req, res) => {
  try {
    const productId = req.params.id;

    let cart = await Cart.findOne({ uid: req.user._id });

    cart.products.map((obj) => {
      if (productId == obj.pid) {
        productInCart = true;

        obj.quantity = obj.quantity + 1;

        return obj;
      }
    });

    await Cart.findOneAndUpdate({ uid: req.user._id }, cart, {
      upsert: true,
    });

    req.flash('success', 'Product quantity increment successful');

    res.redirect('back');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/user');
  }
});

router.get('/cart/decrement/:id', isLoggedIn, isUser, async (req, res) => {
  try {
    const productId = req.params.id;

    let cart = await Cart.findOne({ uid: req.user._id });

    cart.products.map((obj) => {
      if (productId == obj.pid) {
        productInCart = true;

        obj.quantity = obj.quantity - 1;

        return obj;
      }
    });

    await Cart.findOneAndUpdate({ uid: req.user._id }, cart, {
      upsert: true,
    });

    req.flash('success', 'Product quantity decrement successful');

    res.redirect('back');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/user');
  }
});

router.get('/cart/delete/:id', isLoggedIn, isUser, async (req, res) => {
  try {
    const productId = req.params.id;

    let cart = await Cart.findOne({ uid: req.user._id });

    cart.products = cart.products.filter((obj) => obj.pid != productId);

    await Cart.findOneAndUpdate({ uid: req.user._id }, cart, {
      upsert: true,
    });

    req.flash('success', 'Product deletion from cart successful');

    res.redirect('back');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/user');
  }
});

router.get('/orders', isLoggedIn, isUser, async (req, res) => {
  try {
    let orders = await Order.findOne({ uid: req.user._id }).populate(
      'orders.products.pid'
    );

    req.flash('success', 'Orders fetched successfully');

    if (!orders) {
      orders = { orders: [] };
    }

    return res.render('user/orders', { messages: req.flash(), orders });
  } catch (err) {
    req.flash('error', err.message);
    return res.redirect('/user');
  }
});

router.post('/orders/create', isLoggedIn, isUser, async (req, res) => {
  try {
    const cart = await Cart.findOne({ uid: req.user._id }).populate(
      'products.pid'
    );

    let products = [];

    if (cart) {
      products = cart.products.map((product) => {
        return {
          pid: product.pid,
          quantity: product.quantity,
        };
      });
    } else {
      throw new Error('Cart empty');
    }

    const order = {
      products,
      date: Date.now(),
      amount: getCartTotal(cart),
      address: req.body.address,
      modeOfPayment: req.body.modeOfPayment,
    };

    await Order.findOneAndUpdate(
      { uid: req.user._id },
      { $push: { orders: order } },
      { upsert: true }
    );

    await Cart.findOneAndDelete({ uid: req.user._id });

    return res.render('user/order_placed', { messages: req.flash() });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

module.exports = router;
