export const currentUser = (req, res, next) => {
  const isAuthenticated = typeof req.isAuthenticated === "function" && req.isAuthenticated();

  res.locals.user = isAuthenticated ? req.user : null;
  res.locals.isAuthenticated = isAuthenticated;

  next();
};
