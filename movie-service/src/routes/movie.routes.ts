import { Router } from 'express';
import { Movie } from '../models/movie.model';

const router = Router();

router.get('/', async (req, res) => {
  const movies = await Movie.find();
  res.json(movies);
});

router.post('/', async (req, res) => {
  const movie = new Movie(req.body);
  await movie.save();
  res.status(201).json(movie);
});

router.get('/:id', async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    res.status(404).send({ error: 'Not found' })
    return;
  }
  res.json(movie);
});

router.put('/:id/reserve', async (req, res) => {
  const { showTime, seatsToReserve } = req.body;
  const movie = await Movie.findById(req.params.id);

  const show = movie?.shows.find((s: any) => new Date(s.startTime).getTime() === new Date(showTime).getTime());

  if (!show || !show.availableSeats || show.availableSeats < seatsToReserve) {
    res.status(400).json({ error: 'Not enough seats' });
    return;
  }

  show.availableSeats -= seatsToReserve;
  await movie?.save();

  res.json({ message: 'Seats reserved' });
});

export default router;
