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

export const setBlog = async (id: string, blog: any) => {
  await client.setEx(`blog:${id}`, 3600, JSON.stringify(blog));
};

export const getBlog = async (id: string) => {
  const data = await client.get(`blog:${id}`);
  return data ? JSON.parse(data) : null;
};

export const deleteBlog = async (id: string) => {
  await client.del(`blog:${id}`);
};