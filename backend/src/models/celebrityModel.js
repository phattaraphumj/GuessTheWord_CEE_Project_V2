// backend/src/models/celebrityModel.js

// (แก้ไข) เปลี่ยน 'require' เป็น 'import'
import mongoose from 'mongoose';

const CelebritySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String } 
});

// (แก้ไข) เปลี่ยน 'module.exports' เป็น 'export default'
export default mongoose.model('Celebrity', CelebritySchema);