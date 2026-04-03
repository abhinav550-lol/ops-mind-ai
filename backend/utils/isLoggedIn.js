import AppError from "../error/appError.js";

function isLoggedIn(req, res, next) {
	if (!req.session.user) {
		return next(new AppError("You are not logged in", 401));
	}
	next();
}

export default isLoggedIn;