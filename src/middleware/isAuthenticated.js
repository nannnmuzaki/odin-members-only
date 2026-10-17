import { AppError } from "../errors/AppError.js";
import { NOT_FOUND_MESSAGE } from "../errors/notFoundMessage.js";

export const isAuthenticated = (req, _res, next) => {
  if (typeof req.isAuthenticated === "function" && req.isAuthenticated()) {
    return next();
  }

  next(new AppError(NOT_FOUND_MESSAGE, 404));
};
