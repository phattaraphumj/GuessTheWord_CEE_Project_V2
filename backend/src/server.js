// backend/src/server.js

// 1. (แก้ไข) Import 'dotenv/config' เป็นบรรทัดแรกสุด
import 'dotenv/config'; 

// 2. (แก้ไข) เปลี่ยน 'require' เป็น 'import'
import app from './app.js'; 
import connectDB from './config/db.js';

// --- (โค้ดจัดการ Error ของคุณ - ดีอยู่แล้ว) ---
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  console.log(err.stack);
  process.exit(1);
});
// ------------------------------------------

const PORT = process.env.PORT_BACKEND || 3222; 

// เชื่อมต่อ DB
connectDB();

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server ready at http://localhost:${PORT}`);
});

// --- (โค้ดจัดการ Error ของคุณ - ดีอยู่แล้ว) ---
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err);
  server.close(() => { 
    process.exit(1);
  });
});