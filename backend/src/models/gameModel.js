// backend/src/models/gameModel.js

// (แก้ไข) เปลี่ยน 'require' เป็น 'import'
import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  secretCeleb: { type: String, required: true },
  candidates: { type: [String], default: [] },
  status: { type: String, default: 'playing' },
  history: [
    {
      q: String, 
      a: String 
    }
  ],
  category: { type: String, default: 'Default' }
});

// (แก้ไข) เปลี่ยน 'module.exports' เป็น 'export default'
export default mongoose.model('Game', GameSchema);