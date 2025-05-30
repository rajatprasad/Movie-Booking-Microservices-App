import amqp from 'amqplib';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  channel = await connection.createChannel();
  console.log('Connected to RabbitMQ');

  await channel.assertExchange('booking-events', 'topic', { durable: true });
};

export const publishEvent = async (routingKey: string, message: any) => {
  if (!channel) throw new Error('RabbitMQ channel not initialized');

  channel.publish(
    'booking-events',
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
};
