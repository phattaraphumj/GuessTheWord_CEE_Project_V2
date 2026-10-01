// backend/src/controllers/gameController.js
import Game from '../models/gameModel.js';
import Score from '../models/scoreModel.js';

import { getAnswer, judgeGuess, generateSecretWord } from '../services/geminiService.js';

const isGuessAttempt = (item) => item.q?.startsWith('GUESS:');
const countQuestions = (history = []) => history.filter((item) => !isGuessAttempt(item)).length;
const countGuesses = (history = []) => history.filter(isGuessAttempt).length;

// ตัดความยาวและชนิดก่อนใช้ ไม่งั้น payload แปลก ๆ จะไหลไปถึง AI และ DB
const LIMITS = { category: 80, question: 200, guess: 60, name: 40 };

const clean = (value, max) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

// (CRUD: Create)
export const createGame = async (req, res) => {
  try {
    // 1. รับ "หมวดหมู่" (prompt) และ "ชื่อผู้เล่น" จาก Frontend
    const category = clean(req.body?.categoryPrompt, LIMITS.category);
    if (!category) {
      return res.status(400).json({ msg: 'No category prompt provided' });
    }

    const playerName = clean(req.body?.playerName, LIMITS.name) || 'ผู้เล่น';

    // 2. ให้ AI คิดรายชื่อคำในหมวดหมู่ แล้วสุ่มหยิบมาหนึ่งคำ
    const { secretWord, candidates } = await generateSecretWord(category);

    // 3. สร้างเกม
    const newGame = new Game({
      secretWord: secretWord,
      candidates: candidates,
      playerName: playerName,
      category: category,
      history: [],
      status: 'playing',
    });

    await newGame.save();

    // ส่ง pool คำให้ผู้เล่นไปแสดงเป็นปุ่มตัดคำทันที (ไม่ส่ง secretWord)
    res.status(201).json({ gameId: newGame._id, candidates: newGame.candidates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// (CRUD: Read)
export const getGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ msg: 'Game not found' });

    res.json({
      status: game.status,
      history: game.history,
      category: game.category,
      playerName: game.playerName,

      // pool คำทั้งหมดที่ผู้เล่นเห็นเป็นปุ่ม (รวมคำลับอยู่ในนี้ — ตั้งใจให้เล่นแบบตัดคำ)
      candidates: game.candidates,

      // ซ่อนคำตอบไว้ตอนเกมยังไม่จบ
      answer: game.status !== 'playing' ? game.secretWord : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ถามคำถามใช่/ไม่ใช่
export const askQuestion = async (req, res) => {
  try {
    const question = clean(req.body?.question, LIMITS.question);
    if (!question) return res.status(400).json({ msg: 'No question provided' });

    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ msg: 'Game not found' });

    const aiAnswer = await getAnswer(game.secretWord, question);

    game.history.push({ q: question, a: aiAnswer });
    await game.save();

    res.json({ answer: aiAnswer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ส่งคำทาย
export const guessAnswer = async (req, res) => {
  try {
    const guess = clean(req.body?.guess, LIMITS.guess);
    if (!guess) return res.status(400).json({ msg: 'No guess provided' });

    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ msg: 'Game not found' });

    const decision = await judgeGuess(game.secretWord, guess, game.candidates);

    if (decision === 'Yes') {
      game.status = 'won';
      await game.save();

      // บันทึกสถิติไว้ที่กระดานผลงาน (เกมเดิมจะถูกลบทิ้ง ตารางนี้เก็บผลไว้)
      await Score.create({
        playerName: game.playerName,
        category: game.category,
        secretWord: game.secretWord,
        questions: countQuestions(game.history),
        guesses: countGuesses(game.history) + 1,
      });

      res.json({ correct: true, answer: game.secretWord });
    } else {
      game.history.push({ q: `GUESS: ${guess}`, a: 'Incorrect' });
      await game.save();
      res.json({ correct: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// (CRUD: Delete) — ลบเกมและส่งคำเฉลยกลับไปให้หน้าเว็บ
export const deleteGame = async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) return res.status(404).json({ msg: 'Game not found' });

    res.json({ msg: 'Game deleted', answer: game.secretWord });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};