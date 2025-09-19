
import amqp from 'amqplib';
import { ENV_VARS } from './env.config';

let channel: amqp.Channel | null = null;

export const connectToRabbitMQ = async () => {
  try {
    const connection = await amqp.connect({
      protocol: 'amqp',
      hostname: ENV_VARS.RABBITMQ_HOST,
      port: 5672,
      username: ENV_VARS.RABBITMQ_USERNAME,
      password: ENV_VARS.RABBITMQ_PASSWORD,
    });
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ', error);
    process.exit(1);
  }
};

export const publishToQueue = async (queue: string, message: any) => {
  if (!channel) {
    throw new Error('RabbitMQ channel is not available.');
  }
  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
};
