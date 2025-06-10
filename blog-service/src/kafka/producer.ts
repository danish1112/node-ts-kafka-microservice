import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

const kafka = new Kafka({
  clientId: 'blog-service',
  brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(',')
});

const producer = kafka.producer();

export const initKafkaProducer = async () => {
  try {
    await producer.connect();
    console.log('Kafka producer connected');
  } catch (error) {
    console.error('Kafka producer connection failed:', error);
    throw error;
  }
};

export const sendBlogEvent = async (event: { type: string; blogId: string; title: string; authorId: string }) => {
  try {
    await producer.send({
      topic: process.env.KAFKA_TOPIC || 'blog-events',
      messages: [{ value: JSON.stringify(event) }]
    });
    console.log(`Blog event sent: ${event.type}`);
  } catch (error : any) {
    console.error(`Failed to send blog event: ${error.message}`);
    throw error;
  }
};