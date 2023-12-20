// Model
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var mongoDB = 'mongodb://127.0.0.1:27017/LoginDB';

mongoose.connect(mongoDB, {
  useNewUrlParser: true
})
//Connect
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongodb Connect Error'));

// Create Schema
var userSchema = mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  }
});

var User = module.exports = mongoose.model('User', userSchema);


module.exports.createUser = async function(newUser) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newUser.password, salt);
  newUser.password = hash;
  await newUser.save()
}



module.exports.getUserById = async function(id) {
  return await User.findById(id);
}


module.exports.getUserByName = async function(name) {
  var query = {
    name: name
  };
  return await User.findOne(query);
}


module.exports.comparePassword = async function(password, hash) {
  const isMatch = await bcrypt.compare(password, hash);
  return isMatch;
}

