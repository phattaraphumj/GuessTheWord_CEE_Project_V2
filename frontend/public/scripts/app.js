// frontend/public/scripts/app.js
// เมื่อก่อนไฟล์นี้ชื่อ AI.js — ตอนนี้เป็นตัวควบคุมเกมทั้งหมด

import * as api from './apiService.js';
import * as el from './domElements.js';
import * as ui from './ui.js';
import { applyLang, getLang, onLangChange, setLang, t } from './i18n.js';

const STORAGE_KEY = 'gtw.session';
const NAME_KEY = 'gtw.playerName';
const ARM_TIMEOUT = 4000;

let session = readSession();
let questionsAsked = 0;
let busy = false;
let boardScores = [];
let currentStatus = 'playing';
let currentCategory = '';

/* ── เกมที่กำลังเล่นอยู่เก็บใน localStorage เพื่อให้รีเฟรชแล้วกลับมาได้ ── */

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null;
  } catch {
    return null;
  }
}

function writeSession() {
  if (session?.gameId) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ชื่อผู้เล่นเก็บแยกจากเกม เพื่อให้จำได้ข้ามเกม
const readPlayerName = () => localStorage.getItem(NAME_KEY) ?? '';
const writePlayerName = (name) => localStorage.setItem(NAME_KEY, name);

const countQuestions = (history = []) =>
  history.filter((item) => !item.q?.startsWith('GUESS:')).length;

async function loadLeaderboard() {
  try {
    const { scores } = await api.getLeaderboard(10);
    boardScores = scores ?? [];
  } catch (error) {
    boardScores = [];
    console.warn('leaderboard:', error.message);
  }

  renderBoard();
}

function renderBoard() {
  ui.renderLeaderboard(boardScores, readPlayerName());
}

/* ── สถานะระหว่างรอ AI ──────────────────────────────────────── */

function setBusy(value, thinkingKey = 'thinking.thinking') {
  busy = value;

  const controls = [
    el.questionInput,
    el.askBtn,
    el.guessInput,
    el.guessBtn,
    el.restartBtn,
    el.surrenderBtn,
    ...el.quickRow.querySelectorAll('button'),
  ];
  controls.forEach((node) => {
    node.disabled = value;
  });

  if (value) ui.showThinking(thinkingKey);
  else ui.hideThinking();
}

/* ── ปุ่มที่ต้องกดสองครั้ง (ยอมแพ้ / เริ่มใหม่) ─────────────── */

function armButton(button, confirmKey, onConfirm) {
  let timer = null;

  const labelKey = button.dataset.i18n;
  button.textContent = t(labelKey);

  button.addEventListener('click', () => {
    if (button.disabled) return;

    if (button.dataset.armed === 'true') {
      clearTimeout(timer);
      button.dataset.armed = 'false';
      button.classList.remove('is-armed');
      button.textContent = t(labelKey);
      onConfirm();
      return;
    }

    button.dataset.armed = 'true';
    button.classList.add('is-armed');
    button.textContent = t(confirmKey);

    timer = setTimeout(() => {
      button.dataset.armed = 'false';
      button.classList.remove('is-armed');
      button.textContent = t(labelKey);
    }, ARM_TIMEOUT);
  });

  return () => button.textContent = t(labelKey);
}

/* ── หน้าเริ่มเกม ───────────────────────────────────────────── */

function selectChip(chip) {
  el.chipList.querySelectorAll('.chip').forEach((node) => {
    node.setAttribute('aria-pressed', String(node === chip));
  });

  el.categoryInput.value = chip.dataset.category;
  ui.showSetupError('');
}

function resetConsole() {
  questionsAsked = 0;
  currentStatus = 'playing';
  currentCategory = '';

  ui.clearTranscript();
  ui.updateGauge(0);
  ui.setBadge(currentStatus);
  ui.setCategory('');

  el.categoryInput.value = '';
  el.chipList
    .querySelectorAll('.chip')
    .forEach((node) => node.setAttribute('aria-pressed', 'false'));
}

async function discardSessionGame() {
  const gameId = session?.gameId;
  if (!gameId) return;

  session = null;
  writeSession();

  try {
    await api.deleteGame(gameId);
  } catch {
    // เกมเก่าอาจถูกลบไปแล้ว ไม่ต้องทำอะไร
  }
}

async function startGame(category) {
  if (busy) return;

  const playerName = el.playerNameInput.value.trim();
  writePlayerName(playerName);

  el.startBtn.disabled = true;
  el.startBtn.textContent = t('btn.starting');
  setBusy(true, 'thinking.picking');

  try {
    await discardSessionGame();

    const { gameId } = await api.createNewGame(category, playerName);

    session = { gameId, category, playerName, questions: 0 };
    writeSession();

    resetConsole();
    currentCategory = category;
    ui.setCategory(category);
    ui.addNote(t('note.started'));
    ui.showView('play');
    el.questionInput.focus();
  } catch (error) {
    ui.showSetupError(error.message);
  } finally {
    el.startBtn.disabled = false;
    el.startBtn.textContent = t('btn.start');
    setBusy(false);
  }
}

/* ── ถาม / ทาย / ยอมแพ้ ─────────────────────────────────────── */

async function ask(question) {
  if (busy || !session?.gameId) return;

  const text = question.trim();
  if (!text) {
    el.questionInput.focus();
    return;
  }

  ui.addQuestion(text);
  el.questionInput.value = '';
  setBusy(true);

  try {
    const { answer } = await api.askQuestion(session.gameId, text);

    questionsAsked += 1;
    session.questions = questionsAsked;
    writeSession();
    ui.updateGauge(questionsAsked);

    if (answer === 'err') {
      ui.addNote(t('note.aiUnavailable'), 'bad');
    } else {
      ui.addVerdict(answer);
    }
  } catch (error) {
    ui.addNote(error.message, 'bad');
  } finally {
    setBusy(false);
    el.questionInput.focus();
  }
}

async function guess(word) {
  if (busy || !session?.gameId) return;

  const text = word.trim();
  if (!text) {
    el.guessInput.focus();
    return;
  }

  setBusy(true);

  try {
    const result = await api.submitGuess(session.gameId, text);

    if (result.correct) {
      finish('won', result.answer);
      loadLeaderboard();
    } else {
      ui.addNote(t('note.wrongGuess', { guess: text }), 'bad');
      el.guessInput.value = '';
    }
  } catch (error) {
    ui.addNote(error.message, 'bad');
  } finally {
    setBusy(false);
    if (session?.gameId) el.guessInput.focus();
  }
}

async function surrender() {
  if (!session?.gameId) return;

  setBusy(true, 'thinking.revealing');

  try {
    const { answer } = await api.deleteGame(session.gameId);
    finish('surrendered', answer);
  } catch (error) {
    ui.addNote(error.message, 'bad');
  } finally {
    setBusy(false);
  }
}

async function restart() {
  setBusy(true, 'thinking.clearing');

  try {
    await discardSessionGame();
    resetConsole();
    ui.showView('setup');
    el.categoryInput.focus();
  } finally {
    setBusy(false);
  }
}

function finish(result, word) {
  session = null;
  writeSession();
  currentStatus = result;
  ui.setBadge(result);
  ui.reveal({ result, word, questions: questionsAsked });
}

/* ── กลับมาเล่นเกมเดิมหลังรีเฟรช ────────────────────────────── */

async function restore() {
  if (!session?.gameId) {
    ui.showView('setup');
    return;
  }

  try {
    const game = await api.getGame(session.gameId);

    if (game.status !== 'playing') {
      session = null;
      writeSession();
      ui.showView('setup');
      return;
    }

    questionsAsked = countQuestions(game.history);
    currentStatus = game.status;
    currentCategory = game.category || session.category;

    resetConsole();
    currentCategory = game.category || session.category;
    ui.setCategory(currentCategory);
    ui.renderHistory(game.history);
    if (!game.history?.length) ui.addNote(t('note.restored'));
    ui.updateGauge(questionsAsked);
    ui.showView('play');
  } catch {
    session = null;
    writeSession();
    ui.showView('setup');
  }
}

/* ── เริ่มทำงาน ────────────────────────────────────────────── */

function init() {
  applyLang();
  ui.renderCategories();
  ui.renderQuickQuestions();

  el.playerNameInput.value = readPlayerName();

  el.playerNameInput.addEventListener('input', () => {
    writePlayerName(el.playerNameInput.value.trim());
    renderBoard();
  });

  el.setupForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const category = el.categoryInput.value.trim();
    if (!category) {
      ui.showSetupError(t('error.emptyCategory'));
      el.categoryInput.focus();
      return;
    }

    startGame(category);
  });

  el.chipList.addEventListener('click', (event) => {
    const chip = event.target.closest('.chip');
    if (chip) selectChip(chip);
  });

  el.questionForm.addEventListener('submit', (event) => {
    event.preventDefault();
    ask(el.questionInput.value);
  });

  el.guessForm.addEventListener('submit', (event) => {
    event.preventDefault();
    guess(el.guessInput.value);
  });

  el.quickRow.addEventListener('click', (event) => {
    const quickButton = event.target.closest('.quick__btn');
    if (!quickButton || busy) return;

    el.questionInput.value = quickButton.dataset.question;
    el.questionInput.focus();
  });

  document.querySelector('.lang').addEventListener('click', (event) => {
    const button = event.target.closest('.lang__btn');
    if (button) setLang(button.dataset.lang);
  });

  armButton(el.surrenderBtn, 'btn.surrenderArmed', surrender);
  armButton(el.restartBtn, 'btn.restartArmed', restart);

  el.playAgainBtn.addEventListener('click', () => {
    resetConsole();
    ui.showView('setup');
    el.categoryInput.focus();
  });

  // เปลี่ยนภาษาแล้ววาดใหม่เฉพาะส่วนที่สร้างด้วย JS
  onLangChange((lang) => {
    applyLang(lang);

    document.querySelectorAll('.lang__btn').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.lang === lang));
    });

    ui.renderCategories();
    ui.renderQuickQuestions();
    ui.refreshDynamicText(currentStatus, currentCategory);
    renderBoard();

    // ชิปหมวดที่เลือกไว้จะหายไปเพราะข้อความเปลี่ยนภาษา — เลือกใหม่ตามที่พิมพ์ไว้
    const typed = el.categoryInput.value.trim();
    if (typed) {
      const match = [...el.chipList.querySelectorAll('.chip')].find(
        (chip) => chip.dataset.category === typed,
      );
      if (match) selectChip(match);
    }
  });

  document.querySelectorAll('.lang__btn').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.lang === getLang()));
  });

  loadLeaderboard();
  restore();
}

init();