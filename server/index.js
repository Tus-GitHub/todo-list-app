import 'dotenv/config';
import express from 'express';

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(express.json());
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(port, '127.0.0.1', (error) => {
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  console.log(`API running at http://127.0.0.1:${port}`);
});
