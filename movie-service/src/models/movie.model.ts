import mongoose from 'mongoose';

const showSchema = new mongoose.Schema({
  startTime: Date,
  availableSeats: Number,
});

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    duration: Number, 
    language: String,
    shows: [showSchema],
  },
  {
    timestamps: true,
  }
);

export const Movie = mongoose.model('Movie', movieSchema);
