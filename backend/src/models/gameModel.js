// backend/src/models/gameModel.js
import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema(
  {
    secretWord: { type: String, required: true },
    candidates: { type: [String], default: [] },
    playerName: { type: String, default: 'ผู้เล่น' },
    status: { type: String, enum: ['playing', 'won', 'surrendered'], default: 'playing' },
    history: [
      {
        q: String,
        a: String
      }
    ],
    category: { type: String, default: 'Default' }
  },
  { timestamps: true },
);

// เกมที่ผู้เล่นทิ้งค้างไว้ (ปิดแท็บกลางคัน) ให้ Mongo ลบให้เองใน 24 ชั่วโมง
// เพราะเกมถูกลบเฉพาะตอนชนะหรือยอมแพ้ เอกสารของผู้เล่นที่เลิกกลางคันจะค้างใน DB ถ้าไม่มี index นี้
GameSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

export default mongoose.model('Game', GameSchema);