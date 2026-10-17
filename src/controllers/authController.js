import passport from "passport";
import { User } from "../models/User.js";
import { body, matchedData, validationResult } from "express-validator";
import bcrypt from "bcrypt";

const errorName = "Name is required and can't be longer than 255 characters";
const errorEmail = "Valid email is required";
const errorEmailIsNotUnique = "Account with this email already exist";
const errorPassword =
  "Password must at least 8 characters long and consisted of uppercase, lowercase, number and symbol";
const errorConfirmPassword =
  "Please confirm your password by typing in the same password you type in password input";

const validateSignUpInput = [
  body("name").ltrim().rtrim().isLength({ min: 1, max: 255 }).withMessage(errorName),
  body("email")
    .trim()
    .isEmail()
    .withMessage(errorEmail)
    .custom(async (value) => {
      const userExist = await User.findByEmail(value);

      if (userExist) {
        throw new Error(errorEmailIsNotUnique);
      }

      return true;
    }),
  body("password")
    .trim()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(errorPassword),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage(errorConfirmPassword),
];

const validateLoginInput = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage(errorEmail),
  body("password").notEmpty().withMessage("Password is required"),
];

export const signUpForm = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  res.render("auth/signup", { values: null });
};

export const signUp = [
  validateSignUpInput,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("auth/signup", {
        errors: errors.array(),
        values: { name: req.body.name, email: req.body.email },
      });
    }

    const { name, email, password } = matchedData(req);

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create(name, email, hashedPassword);

    res.redirect("/auth/login");
  },
];

export const loginForm = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  res.render("auth/login", { values: null });
};

export const login = [
  validateLoginInput,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("auth/login", {
        errors: errors.array(),
        values: { email: req.body.email },
      });
    }

    // Custom callback so we can render the passport auth error on the form
    // instead of redirecting and losing the message.
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).render("auth/login", {
          errors: [{ msg: info?.message }],
          values: { email: req.body.email },
        });
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }

        return res.redirect("/");
      });
    })(req, res, next);
  },
];

export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};
