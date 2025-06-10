import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
import * as notificationService from '../service/notificationService';

dotenv.config();

const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(',')
});

const consumer = kafka.consumer({ groupId: 'notification-group' });

export const startKafkaConsumer = async () => {
  try {
    await consumer.connect();
    const topics = (process.env.KAFKA_TOPIC || 'user-events,blog-events').split(',');
    await Promise.all(topics.map(topic => consumer.subscribe({ topic, fromBeginning: true })));

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = message.value?.toString();
        if (!data) return;

        try {
          const event = JSON.parse(data);
          let notification;

          if (topic === 'user-events') {
            notification = {
              userId: event.userId,
              message: `Welcome, ${event.username}! Your account has been created.`,
              type: 'email'
            };
          } else if (topic === 'blog-events') {
            notification = {
              userId: event.authorId,
              message: `Your blog "${event.title}" has been created.`,
              type: 'in-app'
            };
          }

          if (notification) {
            await notificationService.createNotification(notification as any);
          }
        } catch (error : any) {
          console.error(`Error processing Kafka message: ${error.message}`);
        }
      }
    });
    console.log('Kafka consumer started');
  } catch (error : any) {
    console.error(`Kafka consumer failed: ${error.message}`);
    throw error;
  }
};