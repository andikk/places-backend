const { validationResult } = require('express-validator');
const User = require('../models/user');
const HttpError = require('../models/http-error');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "email name places image");
  } catch (err) {
    const error = new HttpError('Fetching users faild, please try again later', 500 );
    return next(error);
  }
  res.json({users: users.map(user => user.toObject({getters: true}))});
};

const signup  = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const {name, email, password} = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({email: email});
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again later', 500 );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('User exists already, please login instead', 422 );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: 'https://images.pexels.com/photos/1949698/pexels-photo-1949698.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
    password,
    places: []
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError('Creating user failed1', 500);
    return next(error);
  }
  res.status(201).json({user:createdUser.toObject({getters: true})});
};

const login = async (req, res, next) => {
  const {email, password} = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({email: email});
  } catch (err) {
    const error = new HttpError('Logging in failed, please try again later', 500 );
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError('Invalid credentials', 401 );
    return next(error);
  }

  res.json({message: 'Logged in!'});

};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;

