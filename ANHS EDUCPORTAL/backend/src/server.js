require('dotenv').config();
const path = require('path');
const fs = require('fs');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];

// In production it's recommended to set CORS_ORIGIN, but allow the server
// to run with a safe default if the environment variable wasn't provided.
if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
  console.warn('CORS_ORIGIN is not set. The server will use default allowed origins for the public frontend.');
}

const missingEnv = requiredEnv.filter((name) => !process.env[name]);
if (missingEnv.length > 0) {
  console.error(`Missing required environment variable(s): ${missingEnv.join(', ')}`);
  process.exit(1);
}

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`ANHS backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
