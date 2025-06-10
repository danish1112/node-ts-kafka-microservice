import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

export const initRedis = async () => {
  try {
    await client.connect();
    console.log('Redis connected');
  } catch (error) {
    console.error('Redis connection failed:', error);
    throw error;
  }
};

export const setNotification = async (id: string, notification: any) => {
  await client.setEx(`notification:${id}`, 3600, JSON.stringify(notification));
};

export const getNotification = async (id: string) => {
  const data = await client.get(`notification:${id}`);
  return data ? JSON.parse(data) : null;
};

export const setNotificationsByUser = async (userId: string, notifications: any[]) => {
  await client.setEx(`notifications:user:${userId}`, 3600, JSON.stringify(notifications));
};

export const getNotificationsByUser = async (userId: string) => {
  const data = await client.get(`notifications:user:${userId}`);
  return data ? JSON.parse(data) : null;
};