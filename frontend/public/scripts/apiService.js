// frontend/public/scripts/apiService.js

// (สำคัญ!) ตั้งค่า URL และ Port 3222 ของ Backend
const API_URL = 'http://localhost:3222/api/game';

// CRUD: Create
// export async function createNewGame() {
//   const response = await fetch(`${API_URL}/new`, { method: 'POST' });
//   if (!response.ok) throw new Error('Failed to create game');
//   return await response.json(); // { gameId: "..." }
// }

// (วางทับ "createNewGame" เก่า)
export async function createNewGame(prompt) {
  const response = await fetch(`${API_URL}/new`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categoryPrompt: prompt }) // <-- (ส่ง prompt ไปใน body)
  });

  if (!response.ok) throw new Error('Failed to create game');
  return await response.json(); // { gameId: "..." }
}

// CRUD: Read
export async function getGame(gameId) {
  const response = await fetch(`${API_URL}/${gameId}`);
  if (!response.ok) {
    throw new Error('Game not found'); // โยน Error ถ้าหาเกมไม่เจอ (404)
  }
  return await response.json(); // { history: [...] }
}

// CRUD: Update
export async function askQuestion(gameId, question) {
  const response = await fetch(`${API_URL}/${gameId}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: question })
  });
  if (!response.ok) throw new Error('Failed to ask question');
  return await response.json(); // { answer: "Yes" }
}

// (วางโค้ดนี้ "เพิ่ม" เข้าไปในไฟล์)

// ฟังก์ชันใหม่ สำหรับ "ส่งคำทาย"
export async function submitGuess(gameId, guess) {
  const response = await fetch(`${API_URL}/${gameId}/guess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guess: guess }) // (ส่ง 'guess' ไป)
  });
  if (!response.ok) throw new Error('Failed to submit guess');
  return await response.json(); // (รับ { correct: true/false } กลับมา)
}

// CRUD: Delete
export async function deleteGame(gameId) {
  const response = await fetch(`${API_URL}/${gameId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete game');
  return await response.json();
}