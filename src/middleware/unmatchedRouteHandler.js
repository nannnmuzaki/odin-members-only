import { AppError } from "../errors/AppError.js";
import { NOT_FOUND_MESSAGE } from "../errors/notFoundMessage.js";

export const unmatchedRouteHandler = (_req, _res) => {
  throw new AppError(NOT_FOUND_MESSAGE, 404);
};
