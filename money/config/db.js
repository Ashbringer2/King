// config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export function connectDB() {
  mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser and useUnifiedTopology are defaults in Mongoose 6+
  })
    .then(() => console.log('[MongoDB] Connected'))
    .catch(err => console.error('[MongoDB] Connection Error:', err));
}
