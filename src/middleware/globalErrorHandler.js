import { handlePgError } from "../utils/handlePgError.js";

export const globalErrorHandler = (err, _req, res, _next) => {
  let error = err;

  if (error.code && typeof error.code === "string") {
    error = handlePgError(error);
  }

  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational || false;

  const userMessage = isOperational
    ? error.message
    : "Something went wrong on our end. Please try again later.";

  res.status(statusCode).render("error-page", {
    statusCode,
    message: userMessage,

    devDetails:
      process.env.NODE_ENV !== "production"
        ? {
            originalMessage: err.message,
            code: err.code,
            stack: err.stack,
          }
        : null,
  });
};
