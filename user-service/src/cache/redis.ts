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

export const setUser = async (id: string, user: any) => {
  await client.setEx(`user:${id}`, 3600, JSON.stringify(user));
};

export const getUser = async (id: string) => {
  const data = await client.get(`user:${id}`);
  return data ? JSON.parse(data) : null;
};