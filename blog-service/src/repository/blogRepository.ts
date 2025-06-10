import { Pool } from 'pg';
import { pool } from '../db/postgres';

export interface Blog {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
}

export const createBlog = async (blog: { title: string; content: string; authorId: string }) => {
  const query = `
    INSERT INTO blogs (id, title, content, author_id)
    VALUES (gen_random_uuid(), $1, $2, $3)
    RETURNING id, title, content, author_id as "authorId", created_at as "createdAt"
  `;
  const values = [blog.title, blog.content, blog.authorId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const findBlogById = async (id: string) => {
  const query = `
    SELECT id, title, content, author_id as "authorId", created_at as "createdAt"
    FROM blogs WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const updateBlog = async (id: string, blog: { title?: string; content?: string }) => {
  const query = `
    UPDATE blogs
    SET title = COALESCE($1, title), content = COALESCE($2, content)
    WHERE id = $3
    RETURNING id, title, content, author_id as "authorId", created_at as "createdAt"
  `;
  const values = [blog.title, blog.content, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deleteBlog = async (id: string) => {
  const query = 'DELETE FROM blogs WHERE id = $1';
  await pool.query(query, [id]);
};