//Router
var express = require('express');
var router = express.Router();
var User = require('../model/user');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

const {
  check,
  validationResult
} = require('express-validator');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/register', function(req, res, next) {
  res.render('register');
});
router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/users/login');
  });
});  


router.post('/login', passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: true
  }),
  function(req, res) {
        req.flash("success", "ลงชื่อเข้าใช้เรียบร้อยแล้ว");
        res.redirect('/');
});

// นำ user.id ไปเช็คว่ามีในระบบ
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// หลังจากได้ id มาแล้ว เราเอามาใช้ต่อที่นี่ เพื่อทำการดึงข้อมูลส่วนอื่นๆของ user ไปใช้งานต่อ 
passport.deserializeUser(async function(id, done) {
  const user = await User.getUserById(id);
  done(null, user);
});


// check username passsword ว่าตรงกับในระบบมั๊ย
passport.use(new LocalStrategy(async function(username, password, done) {
  try {
    const user = await User.getUserByName(username);
    if (!user) {
      return done(null, false);
    }
    const isMatch = await User.comparePassword(password, user.password);
    if (isMatch) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (err) {
    return done(err);
  }
}));

router.post('/register', [
  check('email', 'กรุณาป้อนอีเมล').isEmail(),
  check('name', 'กรุณาป้อนชื่อของท่าน').not().isEmpty(),
  check('password', 'กรุณาป้อนรหัสผ่าน').not().isEmpty()
],  async function(req, res, next) {
  const result = validationResult(req);
  var errors = result.errors;
  //Validation Data
  if (!result.isEmpty()) {
    //Return error to views
    res.render('register', {
      errors: errors
    })
  } else {
    //Insert  Data
    var name = req.body.name;
    var password = req.body.password;
    var email = req.body.email;
    var newUser = new User({
      name: name,
      password: password,
      email: email
    });
    await User.createUser(newUser);
    res.location('/');
    res.redirect('/');
  }
});

module.exports = router;
