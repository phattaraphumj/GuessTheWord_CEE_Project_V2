// backend/src/config/db.js

// (แก้ไข) เปลี่ยน 'require' เป็น 'import'
import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.error(
      '❌ MONGODB_URI is not set. Copy .env.template to .env and fill in the values.',
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

// (แก้ไข) เปลี่ยน 'module.exports' เป็น 'export default'
export default connectDB;