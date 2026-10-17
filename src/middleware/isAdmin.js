import { AppError } from "../errors/AppError.js";
import { NOT_FOUND_MESSAGE } from "../errors/notFoundMessage.js";
import { UserRole } from "../enums/UserRole.js";

export const isAdmin = (req, _res, next) => {
  if (
    typeof req.isAuthenticated === "function" &&
    req.isAuthenticated() &&
    req.user.role === UserRole.ADMIN
  ) {
    return next();
  }

  next(new AppError(NOT_FOUND_MESSAGE, 404));
};
