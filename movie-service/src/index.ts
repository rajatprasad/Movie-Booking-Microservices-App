import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import movieRoutes from './routes/movie.routes';
import { startListener } from './rabbitmqListener';

dotenv.config();
const app = express();
app.use(express.json());

app.use('/api/movies', movieRoutes);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Movie DB connected');
    
    await startListener();

    app.listen(8002, () => {
      console.log('Movie Service listening on port 8002');
    });
  } catch (err) {
    console.error(err);
  }
};

start();
