// backend/src/app.js

// (แก้ไข) เปลี่ยน 'require' เป็น 'import'
import express from 'express';
import cors from 'cors';
import gameRoutes from './routes/gameApi.js'; // <-- ต้องมี .js

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/game', gameRoutes);

// (แก้ไข) เปลี่ยน 'module.exports' เป็น 'export default'
export default app;