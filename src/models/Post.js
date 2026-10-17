import { pool } from "../db/pool.js";
import { randomUUIDv7 } from "node:crypto";

export const Post = {
  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      `
      SELECT posts.id, posts.user_id, posts.title, posts.text,
      posts.created_at, posts.updated_at,
      users.name AS author_name,
      COUNT(posts.id) OVER() AS total_count
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC, posts.id DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset],
    );

    const totalCount = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
    const posts = rows.map(({ total_count, ...post }) => post); // oxlint-disable-line

    return { posts, totalCount };
  },

  async findById(id) {
    const { rows } = await pool.query(
      `
      SELECT posts.id, posts.user_id, posts.title, posts.text,
      posts.created_at, posts.updated_at, users.name AS author_name
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.id = $1
      `,
      [id],
    );

    return rows[0];
  },

  async create(userId, title, text) {
    const { rows } = await pool.query(
      `
      INSERT INTO posts(id, user_id, title, text)
      VALUES($1, $2, $3, $4)
      RETURNING *;
      `,
      [randomUUIDv7(), userId, title, text],
    );

    return rows[0];
  },

  async delete(id) {
    const { rows } = await pool.query(
      `
      DELETE FROM posts
      WHERE id = $1
      RETURNING *;
      `,
      [id],
    );

    return rows[0];
  },
};
