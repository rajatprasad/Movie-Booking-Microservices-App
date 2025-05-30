import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

dotenv.config();
const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Auth DB connected');

    app.listen(8001, () => {
      console.log('Auth Service listening on port 8001');
    });
  } catch (err) {
    console.error(err);
  }
};

start();
