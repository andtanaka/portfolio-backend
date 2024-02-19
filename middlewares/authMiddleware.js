import jwt from 'jsonwebtoken';
import asyncHandler from './async-Handler.js';
import User from '../models/userModel.js';

//Protect routes

const protect = asyncHandler(async (req, res, next) => {
  let token;

  //Read the JWT from the cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); //token decoded
      //o payload do token decoded possui o "userId"
      req.user = await User.findById(decoded.userId).select('-password'); //retorna o user correspondente ao "userId", não preenche o field 'password'
      //essa middleware inclui o parâmetro user ao request no backend
      next();
    } catch (err) {
      console.log(err);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    //precisa ser um usuário cadastrado e com o parâmetro isAdmin = true
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as admin');
  }
};

export { protect, admin };
