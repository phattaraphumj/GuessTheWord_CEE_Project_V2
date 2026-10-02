// backend/src/config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    // throw ไม่ใช่ process.exit — ใน serverless การ exit จะฆ่า instance ทิ้งทั้งตัว
    throw new Error('MONGODB_URI is not set. Copy .env.template to .env and fill in the values.');
  }

  // Serverless เรียก cold start ใหม่ทุกครั้ง → ต้องแคช connection ไว้บน globalThis
  // และจำกัด pool ไว้สัก 1 connection ต่อ instance ไม่งั้น Atlas จะเต็มเร็วมาก
  globalThis.__mongoose ??= mongoose
    .connect(uri, {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 8000,
    })
    .then((m) => m);

  return globalThis.__mongoose;
};

export default connectDB;
