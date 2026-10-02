// frontend/public/scripts/apiService.js
// ชั้นเดียวที่คุยกับ backend — ทุกฟังก์ชันโยน Error พร้อมข้อความภาษาไทยที่อ่านรู้เรื่อง

import { t } from './i18n.js';

// ตอน dev หน้าเว็บอยู่ที่ port 3221 แต่ backend อยู่ที่ 3222 จึงต้องใช้ URL เต็ม
// ตอน production (Vercel) ทั้งหมดอยู่โดเมนเดียวกัน ใช้ path สัมพัทธ์แทน
const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
const BASE = isLocal ? 'http://localhost:3222' : '';

const API_URL = `${BASE}/api/game`;
const LEADERBOARD_URL = `${BASE}/api/leaderboard`;

async function request(url, options = {}) {
  let response;

  try {
    response = await fetch(url, options);
  } catch {
    throw new Error(t('error.network'));
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || data.msg || t('error.server', { status: response.status }),
    );
  }

  return data;
}

const postJson = (url, body) =>
  request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export function createNewGame(category, playerName) {
  return postJson(`${API_URL}/new`, { categoryPrompt: category, playerName });
}

export function getLeaderboard(limit = 10) {
  return request(`${LEADERBOARD_URL}?limit=${limit}`);
}

export function getGame(gameId) {
  return request(`${API_URL}/${gameId}`);
}

export function askQuestion(gameId, question) {
  return postJson(`${API_URL}/${gameId}/ask`, { question });
}

export function submitGuess(gameId, guess) {
  return postJson(`${API_URL}/${gameId}/guess`, { guess });
}

export function deleteGame(gameId) {
  return request(`${API_URL}/${gameId}`, { method: 'DELETE' });
}
