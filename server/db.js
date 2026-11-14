import mongoose from 'mongoose';

let connection;
mongoose.connection.on('disconnected', () => {
  connection = null;
});

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!process.env.MONGODB_URI) {
    const error = new Error('Database is not configured. Please try again later.');
    error.status = 503;
    throw error;
  }
  // Reuse one connection promise across concurrent serverless requests.
  if (!connection) {
    connection = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 5,
      })
      .catch(() => {
        connection = null;
        const error = new Error('Unable to reach the database. Please try again.');
        error.status = 503;
        throw error;
      });
  }
  return connection;
}
