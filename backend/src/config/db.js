// backend/src/config/db.js

// (แก้ไข) เปลี่ยน 'require' เป็น 'import'
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

// (แก้ไข) เปลี่ยน 'module.exports' เป็น 'export default'
export default connectDB;