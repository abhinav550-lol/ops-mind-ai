import AppError from "../error/appError.js";

function isCompany(req, res, next) {
  if (req.session.user.role !== "company") {
    return next(new AppError("Access denied. Only companies can perform this action.", 403));
  }
  next();
}

export default isCompany;
