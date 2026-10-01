// backend/src/models/gameModel.js
import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
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
});

export default mongoose.model('Game', GameSchema);