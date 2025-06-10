import express, { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import winston from 'winston';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import notificationRoutes from './api/routes/notificationRoutes';
import { initDb } from './db/postgres';
import { initRedis } from './cache/redis';
import { startKafkaConsumer } from './kafka/consumer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

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

// Routes
app.use('/api/v1/notifications', notificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({ status: 'Notification Service is running' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, { stack: err.stack });
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
});

// Initialize DB, Redis, and Kafka, then start server
Promise.all([initDb(), initRedis(), startKafkaConsumer()])
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Notification Service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error(`Failed to initialize service: ${err.message}`);
    process.exit(1);
  });

export default app;