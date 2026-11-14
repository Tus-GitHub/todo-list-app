import express from 'express';
import { connectDB } from './db.js';
import taskRoutes from './routes/tasks.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.get('/api/health', async (req, res) => {
  await connectDB();
  res.json({ status: 'ok', database: 'connected' });
});

app.use(
  '/api/tasks',
  async (req, res, next) => {
    await connectDB();
    next();
  },
  taskRoutes,
);
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found.' }));

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must be valid JSON.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Task details are too large.' });
  }
  if (error.status === 503) return res.status(503).json({ message: error.message });
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(error.errors)[0].message });
  }
  console.error('API request failed:', error.name);
  res.status(500).json({ message: 'Unable to process your request.' });
});

export default app;
