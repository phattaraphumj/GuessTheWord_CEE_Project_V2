// backend/src/routes/gameApi.js

// (แก้ไข) เปลี่ยน 'require' เป็น 'import'
import express from 'express';
// (แก้ไข) Import แบบ 'named' จาก controller
import { createGame, getGame, askQuestion, deleteGame, guessAnswer } from '../controllers/gameController.js'; // <-- (เพิ่ม guessAnswer)

const router = express.Router();

router.post('/new', createGame);
router.get('/:id', getGame);
router.post('/:id/ask', askQuestion);
router.delete('/:id', deleteGame);

// (วางโค้ดนี้ "เพิ่ม" เข้าไปในไฟล์)
router.post('/:id/guess', guessAnswer); // <-- เส้นทางสำหรับ "การทาย"

// (แก้ไข) เปลี่ยน 'module.exports' เป็น 'export default'
export default router;