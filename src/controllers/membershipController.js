import { body, matchedData, validationResult } from "express-validator";
import { User } from "../models/User.js";
import { verifyPasscode } from "../utils/verifyPasscode.js";
import { UserRole } from "../enums/UserRole.js";

const passcodeError = "Passcode is required and max 255 characters";

const validatePasscode = [
  body("passcode").trim().isLength({ min: 1, max: 255 }).withMessage(passcodeError),
];

export const joinForm = (req, res) => {
  // Admins are the top authority and don't need club membership.
  if (req.user.membership || req.user.role === UserRole.ADMIN) {
    return res.redirect("/");
  }

  res.render("membership/join", { values: null });
};

export const join = [
  validatePasscode,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("membership/join", {
        errors: errors.array(),
        values: null,
      });
    }

    const { passcode } = matchedData(req);

    if (!verifyPasscode(passcode, process.env.CLUB_PASSCODE)) {
      return res.status(401).render("membership/join", {
        errors: [{ msg: "Incorrect club passcode" }],
        values: null,
      });
    }

    await User.joinClub(req.user.id);

    res.redirect("/");
  },
];

export const adminForm = (req, res) => {
  if (req.user.role === UserRole.ADMIN) {
    return res.redirect("/");
  }

  res.render("membership/admin", { values: null });
};

export const admin = [
  validatePasscode,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("membership/admin", {
        errors: errors.array(),
        values: null,
      });
    }

    const { passcode } = matchedData(req);

    if (!verifyPasscode(passcode, process.env.ADMIN_PASSCODE)) {
      return res.status(401).render("membership/admin", {
        errors: [{ msg: "Incorrect admin passcode" }],
        values: null,
      });
    }

    await User.setAdmin(req.user.id);

    res.redirect("/");
  },
];
