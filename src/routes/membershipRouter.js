import { Router } from "express";
import { joinForm, join, adminForm, admin } from "../controllers/membershipController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

export const membershipRouter = Router();

membershipRouter.use(isAuthenticated);

membershipRouter.get("/join", joinForm);
membershipRouter.post("/join", join);
membershipRouter.get("/admin", adminForm);
membershipRouter.post("/admin", admin);
