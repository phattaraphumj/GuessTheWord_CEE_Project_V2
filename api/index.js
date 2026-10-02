// api/index.js — entry สำหรับ Vercel Serverless Function
// โครงสร้างนี้ทำให้ Vercel รันทุกอย่าง (ทั้งหน้าเว็บและ API) เป็น function เดียว
// จึงไม่มีปัญหา CORS ข้ามโดเมน และไม่ต้องแยก static ออกไปอีกชิ้น
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import gameRoutes from '../backend/src/routes/gameApi.js';
import leaderboardRoutes from '../backend/src/routes/leaderboardApi.js';
import connectDB from '../backend/src/config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

// เสิร์ฟไฟล์ static ของ frontend ก่อน เพื่อไม่ให้ request ไฟล์ต้องรอฐานข้อมูล
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// Serverless คืน instance เดิมไว้เมื่อ warm — เชื่อมต่อฐานข้อมูลครั้งเดียวต่อ instance
const dbReady = (globalThis.__mongo ??= connectDB());
dbReady.catch(() => {}); // กัน unhandled rejection ตอน cold start

app.use(async (_req, res, next) => {
  try {
    await dbReady;
    next();
  } catch (err) {
    res.status(503).json({
      error: 'Database unavailable',
      detail: err.message,
    });
  }
});

app.use('/api/game', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

export default app; // Vercel ต้องการ export app ไม่ใช่ app.listen()
