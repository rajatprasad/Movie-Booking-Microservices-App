import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { RequestHandler } from 'express';

const signUpController: RequestHandler = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed, name });
    await user.save();

    if (!process.env.JWT_SECRET) {
      res.status(500).json({ error: 'JWT secret not configured' });
      return;
    }

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

const logInController: RequestHandler = async (req , res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    if (!process.env.JWT_SECRET) {
      res.status(500).json({ error: 'JWT secret not configured' });
      return;
    }

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export {signUpController, logInController};