var express = require('express');
const Register = require('../models/reg');
const AdminRegister = require('../models/adReg');
const session = require('express-session');
const router = express.Router();

router.use(
  session({
    secret: 'SECRET',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000 },
  })
);

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// Middleware to check if admin is logged in
function isAdminLoggedIn(req, res, next) {
  if (req.session.admin) {
    return next();
  }
  res.redirect('/adminLogin');
}

// Routes
router.get('/', isLoggedIn, function (req, res, next) {
  res.render('index');
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.get('/reg', function (req, res, next) {
  res.render('registration');
});

router.get('/admin', isAdminLoggedIn, function (req, res, next) {
  res.render('adminHome');
});

router.get('/adminLogin', function (req, res, next) {
  res.render('adminLogin');
});

router.get('/adminReg', function (req, res, next) {
  res.render('adminReg');
});

// User Registration
router.post('/reg', async function (req, res, next) {
  try {
    const existingUser = await Register.findOne({
      username: req.body.username,
    });
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }
    const registerEmployee = new Register({
      username: req.body.username,
      fullname: req.body.fullname,
      email: req.body.email,
      password: req.body.password,
    });
    await registerEmployee.save();
    res.status(201).redirect('/login');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const user = await Register.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(400).send('Username or Password Incorrect');
    }

    // Create a session for the user
    req.session.user = { id: user._id, username: user.username };
    res.status(201).redirect('/');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Admin Registration
router.post('/adminReg', async function (req, res, next) {
  try {
    const existingAdmin = await AdminRegister.findOne({
      username: req.body.username,
    });
    if (existingAdmin) {
      return res.status(400).send('Username already exists');
    }

    const existingAdminID = await AdminRegister.findOne({ ID: req.body.ID });
    if (existingAdminID) {
      return res.status(400).send('ID already exists');
    }

    const registerAdmin = new AdminRegister({
      username: req.body.username,
      ID: req.body.ID,
      fullname: req.body.fullname,
      email: req.body.email,
      password: req.body.password,
    });
    await registerAdmin.save();
    res.status(201).redirect('/adminLogin');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Admin Login
router.post('/adminLogin', async (req, res) => {
  try {
    const username = req.body.username;
    const ID = req.body.ID;
    const password = req.body.password;

    const admin = await AdminRegister.findOne({ username, ID });
    if (!admin || admin.password !== password) {
      return res.status(400).send('Username, Password, or ID Incorrect');
    }

    // Create a session for the admin
    req.session.admin = { id: admin._id, username: admin.username };
    res.status(201).redirect('/admin');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// User Logout
router.get('/logout', function (req, res, next) {
  req.session.destroy(err => {
    if (err) {
      return next(err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

// Admin Logout
router.get('/adminLogout', function (req, res, next) {
  req.session.destroy(err => {
    if (err) {
      return next(err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/adminLogin');
  });
});

module.exports = router;
