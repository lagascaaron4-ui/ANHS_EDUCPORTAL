require('dotenv').config();
const path = require('path');
const fs = require('fs');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];

if (process.env.NODE_ENV === 'production') {
  requiredEnv.push('CORS_ORIGIN');
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
