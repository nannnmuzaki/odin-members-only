import { AppError } from "../errors/AppError.js";
import { NOT_FOUND_MESSAGE } from "../errors/notFoundMessage.js";
import { Post } from "../models/Post.js";
import { UserRole } from "../enums/UserRole.js";
import { body, matchedData, validationResult } from "express-validator";
import { getPaginationRange } from "../utils/getPaginationRange.js";

const titleError = "Title is required and max 255 characters";
const textError = "Text is required and max 2000 characters";

const validatePost = [
  body("title").trim().isLength({ min: 1, max: 255 }).withMessage(titleError),
  body("text").trim().isLength({ min: 1, max: 2000 }).withMessage(textError),
];

export const index = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);

  const { posts, totalCount } = await Post.findAll(page, limit);
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const paginationRange = getPaginationRange(page, totalPages);

  res.render("index", {
    posts,
    currentPage: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    paginationRange,
  });
};

export const create = (_req, res) => {
  res.render("posts/create", { values: null });
};

export const store = [
  validatePost,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("posts/create", {
        errors: errors.array(),
        values: req.body,
      });
    }

    const { title, text } = matchedData(req);

    await Post.create(req.user.id, title, text);

    res.redirect("/");
  },
];

export const destroy = async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError("No post with this ID was found", 404);
  }

  const isOwner = post.user_id === req.user.id;
  const isAdminUser = req.user.role === UserRole.ADMIN;

  if (!isOwner && !isAdminUser) {
    throw new AppError(NOT_FOUND_MESSAGE, 404);
  }

  await Post.delete(post.id);

  res.redirect("/");
};
