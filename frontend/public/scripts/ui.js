// frontend/public/scripts/ui.js

// (Imports... ของคุณน่าจะหน้าตาประมาณนี้)
import {
  gameStateSpan,
  actorNameSpan,
  pickedActorDiv,
  surrenderBtn,
  logList,
  customQuestionInput,
  categoryPrompt,
  startBtn,
  categoryInputWrapper,
  categoryHeader,
  guessInput, // (อาจจะต้อง import เพิ่ม)
  submitGuessBtn // (อาจจะต้อง import เพิ่ม)
} from './domElements.js';


// (วางทับ "updateGameState" เก่า)
export function updateGameState(state, answer = null, category = null) {
  gameStateSpan.textContent = state;

  // --- 1. (สำคัญ!) โค้ดสำหรับ "กล่องสี" ---
  const infoBoxes = document.querySelectorAll('.info');
  
  // (A) รีเซ็ตสีทั้งหมด
  infoBoxes.forEach(box => {
    box.classList.remove('info-win', 'info-surrender');
  });

  // (B) เพิ่มสีที่ถูกต้อง
  if (state === 'Won') {
    infoBoxes.forEach(box => box.classList.add('info-win')); // (สีเขียว)
  } else if (state === 'Surrendered') {
    infoBoxes.forEach(box => box.classList.add('info-surrender')); // (สีแดง)
  }
  // --- (จบโค้ดกล่องสี) ---


  // --- 2. โค้ดแสดง "คำตอบ" ---
  if (answer) {
    actorNameSpan.textContent = answer;
    pickedActorDiv.classList.remove('hidden');
  } else {
    actorNameSpan.textContent = '—';
    pickedActorDiv.classList.add('hidden');
  }
  
  // --- 3. โค้ดสลับ "ปุ่ม" และ "หมวดหมู่" ---
  const categoryText = category || localStorage.getItem('gameCategory'); // (ใช้ 'category' ที่ส่งมา)

  if (state === 'playing') { // (แก้เป็น 'playing' ตัวเล็ก)
    categoryHeader.textContent = `Category: ${categoryText}`;
    categoryPrompt.classList.add('hidden');
    startBtn.classList.add('hidden');
    surrenderBtn.classList.remove('hidden');
    
    // (เปิดช่องพิมพ์)
    setInputDisabled(false); 
    
  } else {
    // (สถานะ: Not started, Won, Surrendered)
    categoryHeader.textContent = 'Category (Prompt)'; 
    categoryPrompt.classList.remove('hidden');
    categoryPrompt.value = ''; // (เคลียร์ช่อง prompt)
    startBtn.classList.remove('hidden');
    surrenderBtn.classList.add('hidden');
    
    // (ปิดช่องพิมพ์)
    setInputDisabled(true); 
  }
}

/** เพิ่มข้อความลงใน Log */
// VVVV (แก้ไขฟังก์ชันนี้) VVVV
export function addLogMessage(text, messageClass = null) {
  const li = document.createElement('li');
  li.textContent = text;
  
  // (เพิ่ม) ถ้ามี class ส่งมา (เช่น 'system-correct')
  if (messageClass) {
    li.classList.add(messageClass);
  }
  
  logList.prepend(li);
}
// ^^^^ (แก้ไขฟังก์ชันนี้) ^^^^


/** วาดประวัติ (history) เก่าตอนโหลดหน้า */
export function renderHistory(history) {
  logList.innerHTML = ''; // เคลียร์ Log เก่า
  for (let i = history.length - 1; i >= 0; i--) {
    const item = history[i];
    addLogMessage(`A: ${item.a}`, 'log-ai'); 
    addLogMessage(`Q: ${item.q}`);
  }
}

/** เคลียร์ช่อง input ถาม */
export function clearInput() { // (เปลี่ยนชื่อจาก clearInputs)
  customQuestionInput.value = '';
}

/** ล็อก/ปลดล็อก ช่องพิมพ์ทั้งหมด */
export function setInputDisabled(disabled) {
  customQuestionInput.disabled = disabled;
  guessInput.disabled = disabled;
  submitGuessBtn.disabled = disabled;
  // (ปุ่ม Ask อยู่ใน form แต่เราล็อก input ก็พอ)
}