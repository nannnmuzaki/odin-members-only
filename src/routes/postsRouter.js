import { Router } from "express";
import { create, store, destroy } from "../controllers/postController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

export const postsRouter = Router();

postsRouter.get("/new", isAuthenticated, create);
postsRouter.post("/new", isAuthenticated, store);
// Ownership is checked in the controller: authors delete their own posts,
// admins can delete any post.
postsRouter.post("/:id/delete", isAuthenticated, destroy);
