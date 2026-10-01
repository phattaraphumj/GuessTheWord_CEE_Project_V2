// backend/src/app.js
import express from 'express';
import cors from 'cors';
import gameRoutes from './routes/gameApi.js';
import leaderboardRoutes from './routes/leaderboardApi.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/game', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

export default app;