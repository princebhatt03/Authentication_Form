var express = require('express');
const Register = require('./reg');
var router = express.Router();

router.get('/', isLoggedIn, function (req, res, next) {
  res.render('index');
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.get('/reg', function (req, res, next) {
  res.render('registration');
});

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
    const registered = await registerEmployee.save();
    res.status(201).render('index');
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/login', async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const regUsername = await Register.findOne({ username: username });
    if (regUsername.password === password) {
      res.status(201).render('index');
    }
    // console.log(regUsername);
  } catch (error) {
    res.status(400).send('Username or Password Incorrect');
  }
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = router;
