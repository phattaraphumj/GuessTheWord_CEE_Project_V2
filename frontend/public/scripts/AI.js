// frontend/public/scripts/AI.js

// 1. Import "ผู้เชี่ยวชาญ" ทั้งหมด
import * as api from './apiService.js';
import * as ui from './ui.js';
import * as dom from './domElements.js';

// VVVV (แก้ไข) VVVV
// (เพิ่ม surrenderBtn เข้าไปใน import)
import { submitGuessBtn, guessInput, surrenderBtn } from './domElements.js';
// ^^^^ (แก้ไข) ^^^^


// --- (2) Event Handlers (ฟังก์ชัน "จัดการ" เหตุการณ์) ---

async function handleStartGame() {
  try {
    const prompt = dom.categoryPrompt.value;
    if (!prompt) {
      alert('กรุณาใส่หมวดหมู่ก่อนเริ่มเกมครับ!');
      return; 
    }

    const oldGameId = localStorage.getItem('currentGameId');
    if (oldGameId) {
      await api.deleteGame(oldGameId); 
    }
    
    const data = await api.createNewGame(prompt); 
    localStorage.setItem('currentGameId', data.gameId);
    // (เพิ่ม) จำ Category ไว้ด้วย
    localStorage.setItem('gameCategory', prompt); 
    
    // (แก้) ส่ง 'playing' (ตัวเล็ก)
    ui.updateGameState('playing', null, prompt); 
    ui.renderHistory([]); 
    
    dom.customQuestionInput.value = ''; 
    dom.guessInput.value = '';        
    
    ui.addLogMessage('Ask your first question.');
    
  } catch (err) {
    console.error('Error starting new game:', err);
    // (แก้) ใช้ 'Error'
    ui.updateGameState('Error'); 
    // VVVV (แก้ไข) VVVV
    ui.addLogMessage('Error - Cannot connect to server', 'system-incorrect');
    // ^^^^ (แก้ไข) ^^^^
  }
}

/** [CRUD: Update] ถามคำถาม Yes/No */
async function handleAskQuestion(event) {
  event.preventDefault(); 
  
  const question = dom.customQuestionInput.value;
  if (!question) return;

  const gameId = localStorage.getItem('currentGameId');
  if (!gameId) {
    // VVVV (แก้ไข) VVVV
    ui.addLogMessage('Error: Please start a new game first.', 'system-incorrect');
    // ^^^^ (แก้ไข) ^^^^
    return;
  }

  ui.addLogMessage(`Q: ${question}`); 
  ui.clearInput();
  ui.setInputDisabled(true); 
  
  try {
    const data = await api.askQuestion(gameId, question); 
    ui.addLogMessage(`A: ${data.answer}`, 'log-ai'); // (ใช้ 'log-ai' สำหรับ AI)
  } catch (err) {
    console.error('Error asking question:', err);
    // VVVV (แก้ไข) VVVV
    ui.addLogMessage('Error: Failed to get answer from server.', 'system-incorrect');
    // ^^^^ (แก้ไข) ^^^^
  } finally {
    ui.setInputDisabled(false); 
  }
}

/** [CRUD: Delete] ยอมแพ้ (และจบเกม) */
async function handleSurrender() {
  if (!confirm('Are you sure you want to surrender?')) {
    return; 
  }

  try {
    const gameId = localStorage.getItem('currentGameId');
    
    const data = await api.deleteGame(gameId); 
    
    localStorage.removeItem('currentGameId');
    localStorage.removeItem('gameCategory'); // (ลบ Category ที่จำไว้ด้วย)
    
    // (นี่คือจุดที่สั่งให้ ui.js แสดงผลสีแดง)
    ui.updateGameState('Surrendered', data.answer);
    
    // VVVV (แก้ไข) VVVV
    // (เพิ่ม Log สีแดง)
    ui.addLogMessage(`Surrendered! The correct word was: ${data.answer}`, 'system-incorrect');
    // ^^^^ (แก้ไข) ^^^^
    
  } catch (err) {
    console.error('Error surrendering:', err);
    // VVVV (แก้ไข) VVVV
    ui.addLogMessage('Error: Failed to surrender.', 'system-incorrect');
    // ^^^^ (แก้ไข) ^^^^
  }
}

/** [CRUD: Read] โหลดเกมที่ค้างไว้ (ตอนเปิดหน้าเว็บ) */
async function loadGameOnStart() {
  const gameId = localStorage.getItem('currentGameId');
  // (เพิ่ม) ดึง Category ที่จำไว้
  const category = localStorage.getItem('gameCategory'); 
  
  if (gameId) {
    try {
      const gameData = await api.getGame(gameId); 

      ui.renderHistory(gameData.history); 
      
      // (แก้) ส่ง 'category' ที่จำไว้ (ตัวที่ 3)
      ui.updateGameState(gameData.status, gameData.secretCeleb, category); 
      
    } catch (err) {
      localStorage.removeItem('currentGameId');
      localStorage.removeItem('gameCategory'); // (ลบ Category ด้วย)
      ui.updateGameState('Not started');
    }
  } else {
    ui.updateGameState('Not started');
  }
}

// --- (3) Initial Setup (จุดเริ่มต้น) ---

// (เชื่อมปุ่มกับฟังก์ชัน)
dom.startBtn.addEventListener('click', handleStartGame);
// VVVV (แก้ไข) VVVV
dom.surrenderBtn.addEventListener('click', handleSurrender); // (ต้องใช้ dom.surrenderBtn)
// ^^^^ (แก้ไข) ^^^^
dom.customQuestionForm.addEventListener('submit', handleAskQuestion);

// (รันฟังก์ชันนี้ทันทีที่หน้าเว็บโหลดเสร็จ)
document.addEventListener('DOMContentLoaded', loadGameOnStart);


// [Event 4] กดปุ่ม "Submit Guess"
dom.submitGuessBtn.addEventListener('click', async () => {
  const guess = dom.guessInput.value;
  if (!guess) return;

  const gameId = localStorage.getItem('currentGameId');
  if (!gameId) return;

  try {
    const data = await api.submitGuess(gameId, guess); 

    if (data.correct) {
      // 1. "ทายถูก!" (Winner!)
      ui.addLogMessage(`GUESS: ${guess}`);
      // VVVV (แก้ไข) VVVV
      ui.addLogMessage(`🎉 CORRECT! The answer was: ${data.answer}`, 'system-correct');
      // ^^^^ (แก้ไข) ^^^^
      ui.updateGameState('Won', data.answer); 

      // 2. ลบออกจาก "เบราว์เซอร์"
      localStorage.removeItem('currentGameId');
      localStorage.removeItem('gameCategory'); // (ลบ Category ด้วย)
      
      // 3. ลบออกจาก "Database"
      try {
        await api.deleteGame(gameId);
        console.log(`Won game ${gameId} deleted from DB.`);
      } catch (deleteErr) {
        console.warn('Failed to delete won game from DB.', deleteErr);
      }

    } else {
      // "ทายผิด!"
      ui.addLogMessage(`GUESS: ${guess}`);
      // VVVV (แก้ไข) VVVV
      ui.addLogMessage('❌ Incorrect. Keep trying!', 'system-incorrect');
      // ^^^^ (แก้ไข) ^^^^
      dom.guessInput.value = ''; 
    }
  } catch (err) {
    console.error('Error submitting guess:', err);
    // VVVV (แก้ไข) VVVV
    ui.addLogMessage('Error: Failed to submit guess.', 'system-incorrect');
    // ^^^^ (แก้ไข) ^^^^
  }
});