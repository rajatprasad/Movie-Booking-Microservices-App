import amqp from 'amqplib';
import { Movie } from './models/movie.model';

const EXCHANGE_NAME = 'booking_events';

export const startListener = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

  const q = await channel.assertQueue('', { exclusive: true });

  await channel.bindQueue(q.queue, EXCHANGE_NAME, 'booking.*');

  console.log('RabbitMQ listener started, waiting for booking events...');

  channel.consume(q.queue, async (msg) => {
    if (!msg) return;

    const routingKey = msg.fields.routingKey;
    const data = JSON.parse(msg.content.toString());

    try {
      if (routingKey === 'booking.created') {
        console.log('Booking created event received:', data);

        const { movieId, showTime, seatsBooked } = data;

        await Movie.updateOne(
          { _id: movieId, 'shows.startTime': new Date(showTime) },
          {
            $inc: { 'shows.$.availableSeats': -seatsBooked }
          }
        );

        console.log(`Decreased ${seatsBooked} seats for movie ${movieId} at ${showTime}`);

      } else if (routingKey === 'booking.cancelled') {
        console.log('Booking cancelled event received:', data);

        const { bookingId, movieId, showTime, seatsBooked } = data;

        if (!seatsBooked) {
          console.warn(`Cannot increase seats — missing seatsBooked for booking ${bookingId}`);
          return;
        }

        await Movie.updateOne(
          { _id: movieId, 'shows.startTime': new Date(showTime) },
          {
            $inc: { 'shows.$.availableSeats': seatsBooked }
          }
        );

        console.log(`Increased ${seatsBooked} seats for movie ${movieId} at ${showTime}`);

      } else {
        console.warn('Unknown routing key:', routingKey);
      }
    } catch (err) {
      console.error('Error processing message:', err);
    }

    channel.ack(msg);
  });
};
