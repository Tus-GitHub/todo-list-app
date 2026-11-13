import 'dotenv/config';
import app from './app.js';
import { connectDB } from './db.js';

const port = Number(process.env.PORT || 3001);

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
