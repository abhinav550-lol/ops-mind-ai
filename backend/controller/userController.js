import User from "../models/userModel.js";
import AppError from "../error/appError.js";
import wrapAsyncErrors from "../error/wrapAsyncErrors.js";
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "linkcube-jwt-secret", {
    expiresIn: "1d",
  });
};

// Register
export const register = wrapAsyncErrors(async (req, res , next) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("User already exists with this email", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  const token = generateToken(user._id);

  req.session.token = token;
  req.session.user = user;

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// Login
export const login = wrapAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError("Invalid email or password", 401));
  }

  const token = generateToken(user._id);

  req.session.token = token;
  req.session.user = user;

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// Logout
export const logout = wrapAsyncErrors(async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(new AppError("Failed to logout", 500));
    }

    res.clearCookie("connect.sid");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  });
});

// Get logged in user
export const fetchMe = wrapAsyncErrors((req, res , next) => {
  res.status(200).json({
    success: true,
    user: req.session.user,
  });
});

// Get all companies (for users to browse and select)
export const getAllCompanies = wrapAsyncErrors(async (req, res, next) => {
  const companies = await User.find({ role: "company" }).select("name email createdAt");

  res.status(200).json({
    success: true,
    count: companies.length,
    data: companies,
  });
});