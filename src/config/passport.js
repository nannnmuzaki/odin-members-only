import { Strategy } from "passport-local";
import { User } from "../models/User.js";
import bcrypt from "bcrypt";

export const configurePassport = (passport) => {
  passport.use(
    new Strategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await User.findByEmail(email);

        if (!user) {
          return done(null, false, { message: "Incorrect email or password" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          return done(null, false, { message: "Incorrect email or password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);

      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
