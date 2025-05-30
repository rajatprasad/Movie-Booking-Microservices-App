import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import bookingRoutes from './routes/booking.routes';
import { connectRabbitMQ } from './rabbitmq';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/bookings', bookingRoutes);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Booking DB connected');

    await connectRabbitMQ();

    app.listen(8003, () => {
      console.log('Booking Service listening on port 8003');
    });
  } catch (err) {
    console.error('Startup error:', err);
  }
};

start();
