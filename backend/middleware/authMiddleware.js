import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select("-password");

      next(); 
    } catch (error) {
      console.log(error);

      res.status(401); 
      throw new Error("Not authorized, invalid token");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("No token");
  }
});


const protectOptional = asyncHandler(async (req, res, next) => {
  let token;
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
    } catch (error) {
      req.user = null;
    }
  }
  next(); // 🚨 ALWAYS CONTINUE
});


const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else { 
    res.status(401); 
    throw new Error("Not authorized as an admin");
  }
};
const seller = (req, res, next) => {
  if (req.user && req.user.isSeller) {
     next();
  }
  else {
    res.status(401);
    throw new Error("Not authorized as a seller");
  }
};

const sellerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.isSeller || req.user.isAdmin)) {
      next();
  }
  else {
    res.status(401);
    throw new Error("Not authorized, seller or admin only");
  }
};

export { protect, protectOptional, admin, seller, sellerOrAdmin };
 