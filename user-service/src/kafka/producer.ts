import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

const kafka = new Kafka({
  clientId: 'user-service',
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

export const sendUserEvent = async (event: { type: string; userId: string; username: string }) => {
  try {
    await producer.send({
      topic: process.env.KAFKA_TOPIC || 'user-events',
      messages: [{ value: JSON.stringify(event) }]
    });
    console.log(`User event sent: ${event.type}`);
  } catch (error : any) {
    console.error(`Failed to send user event: ${error.message}`);
    throw error;
  }
};