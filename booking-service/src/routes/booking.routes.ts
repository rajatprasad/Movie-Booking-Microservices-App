import { Router } from "express";
import { Booking } from "../models/booking.model";
import { redlock } from "../redis/lock";
import axios from "axios";
import mongoose from "mongoose";
import { publishEvent } from "../rabbitmq";

const router = Router();

router.post("/", async (req, res) => {
  const { userId, movieId, showTime, seatsBooked } = req.body;
  const lockKey = `lock:movie:${movieId}:show:${showTime}`;
  const MOVIE_SERVICE_URL = process.env.MOVIE_SERVICE_URL || "http://localhost:8002";

  
  const session = await mongoose.startSession();
  await session.startTransaction();

  try {
    const lock = await redlock.acquire([lockKey], 3000);

    
    const { data: movie } = await axios.get(`${MOVIE_SERVICE_URL}/api/movies/${movieId}`);
    const show = movie.shows.find(
      (s: any) => new Date(s.startTime).getTime() === new Date(showTime).getTime()
    );

    if (!show || show.availableSeats < seatsBooked) {
      await lock.release();
      await session.abortTransaction();
      session.endSession();
       res.status(400).json({ error: "Not enough seats available" });
       return;
    }

    
    const booking = new Booking({ userId, movieId, showTime, seatsBooked });
    await booking.save({ session });

    
    try {
      await axios.put(`${MOVIE_SERVICE_URL}/api/movies/${movieId}/reserve`, {
        showTime,
        seatsToReserve: seatsBooked,
      });
    } catch (err) {
      await session.abortTransaction();
      await lock.release();
      session.endSession();
      console.error("Failed to reserve seats in movie-service:", err);
       res.status(500).json({ error: "Failed to reserve seats" });
       return;
    }

    
    await session.commitTransaction();
    session.endSession();
    await lock.release();

    
    await publishEvent("booking.created", {
      bookingId: booking._id.toString(),
      userId,
      movieId,
      showTime,
      seatsBooked,
    });

     res.status(201).json(booking);
     return;
  } catch (err: any) {
    try {
      await session.abortTransaction();
    } catch (_) {} 
    session.endSession();

    console.error("Booking error:", err.message || err);
     res.status(500).json({ error: "Could not process booking" });
     return;
  }
});

router.post("/:id/cancel", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );

    if (booking) {
      await publishEvent("booking.cancelled", {
        bookingId: booking._id.toString(),
        movieId: booking.movieId,
        showTime: booking.showTime,
        seatsBooked: booking.seatsBooked,
        userId: booking.userId,
      });
    }

     res.json(booking);
     return;
  } catch (err) {
    console.error("Cancellation error:", err);
     res.status(500).json({ error: "Failed to cancel booking" });
     return;
  }
});

export default router;
