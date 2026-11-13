import { Router } from 'express';
import Task from '../models/Task.js';

const router = Router();

function isValidDateTime(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return false;
  if (!/(Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) return false;

  // Date.parse rolls dates such as February 31 into March; reject that rollover.
  const day = value.slice(0, 10);
  const calendar = new Date(`${day}T00:00:00Z`);
  return Number.isFinite(calendar.getTime()) && calendar.toISOString().startsWith(day);
}

router.get('/', async (req, res) => {
  const tasks = await Task.find().sort({ scheduledAt: 1, _id: 1 });
  res.json({ tasks });
});

router.post('/', async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ message: 'Please send task details as a JSON object.' });
  }
  if (typeof body.title !== 'string' || !body.title.trim()) {
    return res.status(400).json({ message: 'Task title is required.' });
  }
  if (!isValidDateTime(body.scheduledAt)) {
    return res
      .status(400)
      .json({ message: 'A valid date and time with a time zone are required.' });
  }
  if (body.description != null && typeof body.description !== 'string') {
    return res.status(400).json({ message: 'Description must be text.' });
  }
  if (body.endAt != null && body.endAt !== '' && !isValidDateTime(body.endAt)) {
    return res.status(400).json({ message: 'Choose a valid end date and time.' });
  }

  const task = await Task.create({
    title: body.title.trim(),
    description: body.description ?? '',
    scheduledAt: body.scheduledAt,
    endAt: body.endAt || null,
    priority: body.priority ?? '',
  });
  res.status(201).json({ task });
});

export default router;
