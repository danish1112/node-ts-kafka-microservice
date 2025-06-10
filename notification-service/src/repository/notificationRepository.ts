import { Pool } from 'pg';
import { pool } from '../db/postgres';

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'email' | 'in-app';
  createdAt: Date;
}

export const createNotification = async (notification: { userId: string; message: string; type: 'email' | 'in-app' }) => {
  const query = `
    INSERT INTO notifications (id, user_id, message, type)
    VALUES (gen_random_uuid(), $1, $2, $3)
    RETURNING id, user_id as "userId", message, type, created_at as "createdAt"
  `;
  const values = [notification.userId, notification.message, notification.type];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const findNotificationsByUser = async (userId: string) => {
  const query = `
    SELECT id, user_id as "userId", message, type, created_at as "createdAt"
    FROM notifications WHERE user_id = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};