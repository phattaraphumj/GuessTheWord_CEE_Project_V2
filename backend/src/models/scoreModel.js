// backend/src/models/scoreModel.js
import mongoose from 'mongoose';

const ScoreSchema = new mongoose.Schema(
  {
    playerName: { type: String, required: true, trim: true, maxlength: 40 },
    category: { type: String, default: 'ทั่วไป' },
    secretWord: { type: String, required: true },
    questions: { type: Number, required: true, min: 0 },
    guesses: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

export default mongoose.model('Score', ScoreSchema);