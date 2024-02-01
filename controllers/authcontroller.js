const User = require('../models/user');
const { errorHandler } = require('../helpers/dberrorhandler');
const jwt = require('jsonwebtoken');
const { expressjwt } = require('express-jwt');
require("dotenv/config");

exports.signup = async (req, res) => {
    console.log("req.body", req.body);   
    try {
        const user = new User(req.body);
        const savedUser = await user.save();
        user.hashed_password = undefined;
        res.json({
            user: savedUser
        });
    } catch (error) {
        res.status(400).json({
            error: errorHandler(error)
        });
    }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    const isAuthenticated = await user.authenticate(password);

    if (!user) {
      return res.status(400).json({
        error: "User with that email does not exist. Please sign up",
      });
    }

    if (!isAuthenticated) {
      return res.status(401).json({
        error: "Email and password do not match",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.cookie('t', token, { expire: new Date() + 9999 });
    const { _id, name, role } = user;

    return res.json({ token, user: { _id, email, name, role } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.signout = async (req , res) => {
    res.clearCookie("t");
    res.json({ message: "signout success"})
};

exports.authenticateToken = expressjwt({
  secret: process.env.JWT_SECRET, // Replace with your actual JWT secret from the environment variable
  algorithms: ['HS256'], // Specify the algorithm used to sign the token
  userProperty: 'auth'
});

exports.isAuth = (req, res, next) =>{
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  if(!user){
    return res.status(403).json({
      error: "Access denied"
    })
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
      return res.status(403).json({
          error: 'Admin resourse! Access denied'
      });
  }
  next();
};