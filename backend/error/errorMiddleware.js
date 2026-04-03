import AppError from "./appError.js";

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // MongoDB bad ObjectId
  if (err.name === "CastError") {
    err = new AppError(`Resource not found. Invalid: ${err.path}`, 400);
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(", ");
    err = new AppError(`Duplicate value for: ${field}`, 400);
  }

  // JWT invalid token
  if (err.name === "JsonWebTokenError") {
    err = new AppError("Invalid token, please login again", 401);
  }

  // JWT expired token
  if (err.name === "TokenExpiredError") {
    err = new AppError("Token has expired, please login again", 401);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    err = new AppError(messages.join(". "), 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorMiddleware;
