import { pool } from "../db/pool.js";
import { randomUUIDv7 } from "node:crypto";
import { UserRole } from "../enums/UserRole.js";

export const User = {
  async getAll() {
    const users = await pool.query(
      `
      SELECT id, name, email, membership, role, created_at, updated_at FROM users;
      `,
    );

    return users.rows;
  },

  async findById(id) {
    const user = await pool.query(
      `
      SELECT id, name, email, password, membership, role, created_at, updated_at FROM users
      WHERE id = $1;
      `,
      [id],
    );

    return user.rows[0];
  },

  async findByEmail(email) {
    const user = await pool.query(
      `
      SELECT id, name, email, password, membership, role, created_at, updated_at FROM users
      WHERE email = $1;
      `,
      [email],
    );

    return user.rows[0];
  },

  async create(name, email, password) {
    const user = await pool.query(
      `
      INSERT INTO users(id, name, email, password)
      VALUES($1, $2, $3, $4)
      RETURNING id, name, email, membership, role, created_at, updated_at;
      `,
      [randomUUIDv7(), name, email, password],
    );

    return user.rows[0];
  },

  async joinClub(id) {
    const user = await pool.query(
      `
      UPDATE users
      SET membership = TRUE, updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, email, membership, role;
      `,
      [id],
    );

    return user.rows[0];
  },

  async setAdmin(id) {
    const user = await pool.query(
      `
      UPDATE users
      SET role = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, email, membership, role;
      `,
      [id, UserRole.ADMIN],
    );

    return user.rows[0];
  },
};
