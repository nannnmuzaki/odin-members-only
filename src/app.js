import express from "express";
import path from "node:path";
import process from "node:process";
import session from "express-session";
import connectPGSimple from "connect-pg-simple";
import passport from "passport";
import { pool } from "./db/pool.js";
import { configurePassport } from "./config/passport.js";
import { currentUser } from "./middleware/currentUser.js";
import { globalErrorHandler } from "./middleware/globalErrorHandler.js";
import { unmatchedRouteHandler } from "./middleware/unmatchedRouteHandler.js";
import { indexRouter } from "./routes/indexRouter.js";
import { authRouter } from "./routes/authRouter.js";
import { postsRouter } from "./routes/postsRouter.js";
import { membershipRouter } from "./routes/membershipRouter.js";

try {
  process.loadEnvFile();
} catch (e) {
  console.log(e);
}

const app = express();
const PORT = process.env.APP_PORT;

app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "ejs");

const assetsPath = path.join(import.meta.dirname, "public");
app.use(
  express.static(
    assetsPath,
    process.env.NODE_ENV === "production" ? { maxAge: "1d" } : { maxAge: 0 },
  ),
);

app.use(express.urlencoded({ extended: true }));

const PGStore = connectPGSimple(session);

app.use(
  session({
    store: new PGStore({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

configurePassport(passport);

app.use(currentUser);

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/posts", postsRouter);
app.use("/membership", membershipRouter);

app.use(unmatchedRouteHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Listening at localhost:${PORT}`);
});
