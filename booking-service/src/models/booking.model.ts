import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    movieId: { type: String, required: true },
    showTime: { type: Date, required: true },
    seatsBooked: { type: Number, required: true },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model('Booking', bookingSchema);
