import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from './db.js';

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(express.json());
app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'error',
    database: connected ? 'connected' : 'disconnected',
  });
});

try {
  await connectDB();
  app.listen(port, '127.0.0.1', (error) => {
    if (error) {
      console.error(error.message);
      process.exit(1);
    }
    console.log(`API running at http://127.0.0.1:${port}`);
  });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
