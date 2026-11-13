import { Router } from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import { validateTaskInput } from '../validation/task.js';

const router = Router();

router.param('id', (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return res.status(400).json({ message: 'Invalid task ID.' });
  }
  next();
});

router.get('/', async (req, res) => {
  const tasks = await Task.find().sort({ scheduledAt: 1, _id: 1 });
  res.json({ tasks });
});

router.post('/', async (req, res) => {
  const { values, error } = validateTaskInput(req.body);
  if (error) return res.status(400).json({ message: error });
  const task = await Task.create(values);
  res.status(201).json({ task });
});

router.get('/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  res.json({ task });
});

router.patch('/:id', async (req, res) => {
  const { values, error } = validateTaskInput(req.body, true);
  if (error) return res.status(400).json({ message: error });

  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  Object.assign(task, values);
  if (task.endAt && task.endAt <= task.scheduledAt) {
    return res.status(400).json({ message: 'End time must be after the start time.' });
  }
  await task.save();
  res.json({ task });
});

router.delete('/:id', async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  res.status(204).end();
});

export default router;
