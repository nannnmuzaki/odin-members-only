import { Router } from "express";
import { signUpForm, signUp, loginForm, login, logout } from "../controllers/authController.js";

export const authRouter = Router();

authRouter.get("/signup", signUpForm);
authRouter.post("/signup", signUp);
authRouter.get("/login", loginForm);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
