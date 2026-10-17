import { Router } from "express";
import { index } from "../controllers/postController.js";

export const indexRouter = Router();

indexRouter.get("/", index);
