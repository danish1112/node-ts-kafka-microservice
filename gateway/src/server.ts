import express, { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import winston from 'winston';
import helmet from 'helmet';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Proxy routes
app.use(
  '/users',
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: { '^/users': '' }
  })
);

app.use(
  '/blogs',
  createProxyMiddleware({
    target: process.env.BLOG_SERVICE_URL || 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^/blogs': '' }
  })
);

app.use(
  '/notifications',
  createProxyMiddleware({
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: { '^/notifications': '' }
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({ status: 'API Gateway is running...' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, { stack: err.stack });
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

export default app;