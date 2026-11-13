import express from 'express';
import mongoose from 'mongoose';
import taskRoutes from './routes/tasks.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'error',
    database: connected ? 'connected' : 'disconnected',
  });
});

app.use('/api/tasks', taskRoutes);
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found.' }));

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must be valid JSON.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Task details are too large.' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(error.errors)[0].message });
  }
  console.error('API request failed:', error.name);
  res.status(500).json({ message: 'Unable to process your request.' });
});

export default app;
