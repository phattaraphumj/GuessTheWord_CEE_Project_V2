// frontend/server.js
import express from 'express';
import path from 'path';

// ใช้ __dirname ใน ES Modules (ต้องมี 2 บรรทัดนี้)
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3221;

// สั่งให้ Express "เสิร์ฟ" ไฟล์ทั้งหมดในโฟลเดอร์ 'public'
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Frontend server (Phase 2) running at http://localhost:${PORT}`);
});