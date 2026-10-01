// backend/src/controllers/leaderboardController.js
import Score from '../models/scoreModel.js';

const MAX_LIMIT = 50;

// กระดานผลงาน: ใครใช้คำถามน้อยที่สุด อยู่บนสุด
export const getLeaderboard = async (req, res) => {
  try {
    const requested = Number.parseInt(req.query.limit, 10);
    const limit = Math.min(Number.isNaN(requested) ? 10 : requested, MAX_LIMIT);

    const scores = await Score.find()
      // เรียงตามจำนวนคำถามน้อย → มาก, แล้วจึงดูจำนวนคำทาย
      .sort({ questions: 1, guesses: 1, createdAt: 1 })
      .limit(limit)
      .lean();

    res.json({ scores });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};