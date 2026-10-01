// backend/src/controllers/gameController.js

import Game from '../models/gameModel.js';
//import Celebrity from '../models/celebrityModel.js';

import { getAnswer, judgeGuess, generateSecretWord } from '../services/geminiService.js';

// (CRUD: Create)
// export const createGame = async (req, res) => {
//   try {
//     // เพิ่มข้อมูลตัวอย่าง ถ้าใน DB ไม่มีดาราเลย
//     const celebCount = await Celebrity.countDocuments();
//     if (celebCount === 0) {
//       await Celebrity.create([
//         { name: 'ลิซ่า Blackpink', category: 'นักร้อง' },
//         { name: 'ณเดชน์ คูกิมิยะ', category: 'นักแสดง' },
//       ]);
//     }

//     const celebs = await Celebrity.find();
//     const randomCeleb = celebs[Math.floor(Math.random() * celebs.length)];
    
//     const newGame = await Game.create({
//       secretCeleb: randomCeleb.name,
//       history: []
//     });
    
//     res.status(201).json({ gameId: newGame._id });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// (วางทับ "createGame" เก่า)
export const createGame = async (req, res) => {
  try {
    // 1. (ใหม่) รับ "หมวดหมู่" (prompt) จาก Frontend
    const { categoryPrompt } = req.body;
    if (!categoryPrompt) {
      return res.status(400).json({ msg: 'No category prompt provided' });
    }

    // 2. (ใหม่) ให้ AI คิดคำลับ จากการสุ่มใน list ของ 20 คำในหมวดหมู่นั้น
    const { secretWord, candidates } = await generateSecretWord(categoryPrompt);

    // 3. (ลบ Logic เก่าที่สุ่มดารา)
    // (เราไม่ใช้ Celebrity.count() แล้ว)

    // 4. "สร้างเกม" โดยใช้ "คำลับ" ที่ AI คิด
    const newGame = new Game({
      secretCeleb: secretWord, // (เรายังใช้ field 'secretCeleb' นะครับ แต่ข้างในเป็น "กระทะ")
      candidates: candidates,
      category: categoryPrompt,
      history: [],
      status: 'playing',
    });

    await newGame.save();
    res.status(201).json({ gameId: newGame._id }); // ส่ง ID กลับไป

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// (CRUD: Read)
// (วางทับ "getGame" เก่า)

export const getGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ msg: 'Game not found' });
    
    // --- (นี่คือ Logic ใหม่) ---
    // (เราจะไม่ส่ง "game" ทั้งก้อน)
    // เราจะ "คัดเลือก" เฉพาะสิ่งที่ Frontend ควรรู้
    res.json({
      status: game.status,
      history: game.history,
      category: game.category, // <-- 1. "เพิ่ม" category (แก้ Bug รีเฟรช)
      
      // 2. (สำคัญ!) "ซ่อน" คำตอบ ถ้าเกมยังไม่จบ
      answer: (game.status !== 'playing') ? game.secretCeleb : null
    });
    // --- (จบ Logic ใหม่) ---
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// (CRUD: Update) - เวอร์ชัน "AI จริง"
// export const askQuestion = async (req, res) => {
//   try {
//     const { question } = req.body;
//     if (!question) return res.status(400).json({ msg: 'No question provided' });

//     const game = await Game.findById(req.params.id);
//     if (!game) return res.status(404).json({ msg: 'Game not found' });

//     const secretCeleb = game.secretCeleb;

//     // --- (นี่คือส่วนที่เปลี่ยน!) ---
//     // เราไม่ "ตอบมั่ว" แล้ว
//     // เราเรียก "สมอง AI" ที่เรา Import มา
//     const aiAnswer = await getAnswer(secretCeleb, question);
//     // ------------------------------

//     game.history.push({ q: question, a: aiAnswer });
//     await game.save(); // บันทึก history (Update)

//     res.json({ answer: aiAnswer }); // ส่งคำตอบ "จริง" กลับไป
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // (วางโค้ดนี้ "เพิ่ม" เข้าไปในไฟล์)

// // ฟังก์ชันใหม่ สำหรับ "รับคำทาย"
// export const guessAnswer = async (req, res) => {
//   try {
//     const { guess } = req.body; // 1. ดึง "คำทาย" จาก body
//     if (!guess) return res.status(400).json({ msg: 'No guess provided' });

//     const game = await Game.findById(req.params.id);
//     if (!game) return res.status(404).json({ msg: 'Game not found' });

//     // 2. ส่งไปให้ AI "ตัดสิน"
//     const decision = await judgeGuess(game.secretCeleb, guess);

//     if (decision === 'Yes') {
//       // 3. ถ้า "ทายถูก" (Winner!)
//       game.status = 'won';
//       await game.save();
//       
//       // (สำคัญ!) ส่ง "คำตอบ" กลับไปให้ Frontend โชว์
//       res.json({ correct: true, answer: game.secretCeleb }); 
//     } else {
//       // 4. ถ้า "ทายผิด"
//       // บันทึกการทายที่ผิดลง history
//       game.history.push({ q: `GUESS: ${guess}`, a: 'Incorrect' });
//       await game.save();
//       
//       res.json({ correct: false });
//     }
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// (นี่คือ 'askQuestion' ที่ "ถูกต้อง")
export const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ msg: 'No question provided' });

    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ msg: 'Game not found' });
    
    const secretCeleb = game.secretCeleb;
    
    // เรียก "สมอง AI" (ตัวที่ 1: getAnswer)
    const aiAnswer = await getAnswer(secretCeleb, question);
    
    game.history.push({ q: question, a: aiAnswer });
    await game.save(); 
    
    res.json({ answer: aiAnswer }); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// (นี่คือ 'guessAnswer' ที่ "ถูกต้อง")
export const guessAnswer = async (req, res) => {
  try {
    const { guess } = req.body; 
    if (!guess) return res.status(400).json({ msg: 'No guess provided' });

    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ msg: 'Game not found' });

    // เรียก "สมอง AI" (ตัวที่ 2: judgeGuess)
    const decision = await judgeGuess(game.secretCeleb, guess);

    if (decision === 'Yes') {
      game.status = 'won';
      await game.save();
      res.json({ correct: true, answer: game.secretCeleb }); 
    } else {
      game.history.push({ q: `GUESS: ${guess}`, a: 'Incorrect' });
      await game.save();
      res.json({ correct: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// (CRUD: Delete)
export const deleteGame = async (req, res) => {
  try {
    // 1. (สำคัญ!) "หา" (Find) และ "ลบ" (Delete)
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) return res.status(404).json({ msg: 'Game not found' });
    
    // 2. (นี่คือ "ส่วนที่แก้") "ส่ง" คำเฉลย (secretCeleb) กลับไป
    res.json({ 
      msg: 'Game deleted', 
      answer: game.secretCeleb // <-- 🌟 ส่ง 'answer' กลับไปให้ Frontend
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};