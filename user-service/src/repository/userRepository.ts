import { Pool } from 'pg';
import { pool } from '../db/postgres';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
}

export const createUser = async (user: { username: string; email: string; password: string }) => {
  const query = `
    INSERT INTO users (id, username, email, password)
    VALUES (gen_random_uuid(), $1, $2, $3)
    RETURNING id, username, email
  `;
  const values = [user.username, user.email, user.password];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const findUserByEmail = async (email: string) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

export const findUserById = async (id: string) => {
  const query = 'SELECT id, username, email FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};