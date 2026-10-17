import { AppError } from "../errors/AppError.js";

export const handlePgError = (err) => {
  switch (err.code) {
    case "23503": // foreign_key_violation
      return new AppError(`The selected reference does not exist.`, 400);

    case "23502": // not_null_violation
      return new AppError(`The required field '${err.column || "unknown"}' was missing.`, 400);

    case "22P02": // invalid_text_representation
      return new AppError("Invalid input syntax or format.", 400);

    case "23514": // check_violation
      return new AppError("The submitted values violated validation constraints.", 400);

    default:
      // Return original error if it's an unexpected DB code (like table missing)
      return err;
  }
};
