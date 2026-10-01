// frontend/public/scripts/domElements.js
// รวบรวม element ที่ทุกส่วนต้องใช้ เลือกจาก id ใน index.html ที่จุดเดียว

const byId = (id) => document.getElementById(id);

export const views = {
  setup: byId('view-setup'),
  play: byId('view-play'),
  end: byId('view-end'),
};

// หน้าเริ่มเกม
export const setupForm = byId('setup-form');
export const chipList = byId('category-chips');
export const playerNameInput = byId('player-name');
export const categoryInput = byId('category-prompt');
export const startBtn = byId('start-btn');
export const setupError = byId('setup-error');
export const leaderboardList = byId('leaderboard-list');

// หน้าเล่นเกม
export const badge = byId('game-state');
export const categoryLabel = byId('category-label');
export const gauge = byId('question-gauge');
export const questionCount = byId('question-count');
export const transcript = byId('transcript');
export const restartBtn = byId('restart-btn');
export const surrenderBtn = byId('surrender-btn');

export const questionForm = byId('question-form');
export const questionInput = byId('question-input');
export const askBtn = byId('ask-btn');
export const quickRow = byId('quick-questions');

export const guessForm = byId('guess-form');
export const guessInput = byId('guess-input');
export const guessBtn = byId('submit-guess');

export const wordBank = byId('word-bank');
export const bankLeft = byId('bank-left');

// หน้าเฉลย
export const revealCard = byId('reveal-card');
export const revealEyebrow = byId('reveal-eyebrow');
export const revealWord = byId('reveal-word');
export const revealMeta = byId('reveal-meta');
export const playAgainBtn = byId('play-again-btn');
