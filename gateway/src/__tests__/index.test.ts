import request from 'supertest';
import app from '../server';
import { createProxyMiddleware } from 'http-proxy-middleware';

jest.mock('http-proxy-middleware');

describe('API Gateway', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 OK for health check endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'API Gateway is running' });
  });

  it('should setup proxy middleware for user service', () => {
    expect(createProxyMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({
        target: process.env.USER_SERVICE_URL || 'http://localhost:3001',
        changeOrigin: true,
        pathRewrite: { '^/users': '' }
      })
    );
  });

  it('should setup proxy middleware for blog service', () => {
    expect(createProxyMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({
        target: process.env.BLOG_SERVICE_URL || 'http://localhost:3002',
        changeOrigin: true,
        pathRewrite: { '^/blogs': '' }
      })
    );
  });

  it('should setup proxy middleware for notification service', () => {
    expect(createProxyMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({
        target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003',
        changeOrigin: true,
        pathRewrite: { '^/notifications': '' }
      })
    );
  });
});