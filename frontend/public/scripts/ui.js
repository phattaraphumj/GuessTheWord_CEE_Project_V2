// frontend/public/scripts/ui.js
// ทุกอย่างที่ "วาดหน้าจอ" อยู่ที่ไฟล์นี้ ไม่มีการยิง API
// ข้อความทั้งหมดผ่าน i18n.t() เพื่อให้สลับภาษาได้ทันที

import * as el from './domElements.js';
import { t } from './i18n.js';

export const QUESTION_BUDGET = 20;

const VERDICT_KEYS = {
  Yes: 'verdict.yes',
  No: 'verdict.no',
  Maybe: 'verdict.maybe',
  err: 'verdict.no',
};

const STATUS_KEYS = {
  playing: 'badge.playing',
  won: 'badge.won',
  surrendered: 'badge.surrendered',
};

const VERDICT_CLASS = {
  Yes: 'is-yes',
  No: 'is-no',
  Maybe: 'is-maybe',
  err: 'is-no',
};

let thinkingNode = null;

function scrollToLatest() {
  el.transcript.scrollTop = el.transcript.scrollHeight;
}

function append(node) {
  el.transcript.append(node);
  scrollToLatest();
}

export function showView(name) {
  for (const [key, node] of Object.entries(el.views)) {
    node.hidden = key !== name;
  }
  window.scrollTo({ top: 0 });
}

export function showSetupError(message) {
  el.setupError.textContent = message;
  el.setupError.hidden = !message;
}

export function setCategory(category) {
  el.categoryLabel.textContent = category ? t('category.label', { name: category }) : '';
}

export function setBadge(status) {
  el.badge.textContent = t(STATUS_KEYS[status] ?? status);
  el.badge.dataset.status = status;
}

export function updateGauge(used, budget = QUESTION_BUDGET) {
  if (el.gauge.childElementCount !== budget) {
    el.gauge.replaceChildren(
      ...Array.from({ length: budget }, () => {
        const tick = document.createElement('span');
        tick.className = 'gauge__tick';
        return tick;
      }),
    );
  }

  const filled = Math.min(used, budget);
  [...el.gauge.children].forEach((tick, index) => {
    tick.classList.toggle('is-used', index < filled);
  });

  el.questionCount.textContent = String(used);
}

export function clearTranscript() {
  el.transcript.replaceChildren();
  thinkingNode = null;
}

export function addQuestion(text) {
  const node = document.createElement('p');
  node.className = 'entry entry--question';
  node.textContent = text;
  append(node);
}

export function addVerdict(answer) {
  const node = document.createElement('p');
  node.className = `entry entry--answer ${VERDICT_CLASS[answer] ?? 'is-maybe'}`;

  const chip = document.createElement('span');
  chip.className = 'verdict';
  chip.dataset.answer = answer;
  chip.textContent = t(VERDICT_KEYS[answer] ?? 'verdict.maybe');

  node.append(chip);
  append(node);
}

export function addNote(text, tone = 'plain') {
  const node = document.createElement('p');
  node.className = 'entry entry--note';
  if (tone === 'good') node.classList.add('is-good');
  if (tone === 'bad') node.classList.add('is-bad');
  node.textContent = text;
  append(node);
}

export function showThinking(key) {
  hideThinking();

  thinkingNode = document.createElement('p');
  thinkingNode.className = 'entry entry--note thinking';
  thinkingNode.dataset.i18nKey = key;

  const dot = document.createElement('span');
  dot.className = 'thinking__dot';

  const text = document.createElement('span');
  text.className = 'thinking__text';
  text.textContent = t(key);

  thinkingNode.append(dot, text);
  append(thinkingNode);
}

export function hideThinking() {
  thinkingNode?.remove();
  thinkingNode = null;
}

export function renderHistory(history = []) {
  for (const item of history) {
    if (item.q?.startsWith('GUESS:')) {
      addNote(t('note.wrongGuess', { guess: item.q.replace('GUESS:', '').trim() }), 'bad');
      continue;
    }
    addQuestion(item.q ?? '');
    addVerdict(item.a ?? 'Maybe');
  }
}

export function reveal({ result, word, questions }) {
  el.revealCard.dataset.result = result;

  el.revealEyebrow.textContent =
    result === 'won' ? t('reveal.won') : t('reveal.reveal');

  el.revealWord.textContent = word ?? '—';
  el.revealMeta.textContent = t(
    result === 'won' ? 'reveal.metaWin' : 'reveal.metaLose',
    { n: questions },
  );

  showView('end');
}

/* ── หมวดหมู่ + คำถามใช่/ไม่ใช่ (สร้างจาก i18n ทุกครั้งที่เปลี่ยนภาษา) ── */

export function renderCategories() {
  el.chipList.replaceChildren(
    ...t('categories').map((category) => {
      const item = document.createElement('li');
      const chip = document.createElement('button');

      chip.type = 'button';
      chip.className = 'chip';
      chip.dataset.category = category;
      chip.textContent = category;
      chip.setAttribute('aria-pressed', 'false');

      item.append(chip);
      return item;
    }),
  );
}

export function renderQuickQuestions() {
  el.quickRow.replaceChildren(
    ...t('quickQuestions').map((question) => {
      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'quick__btn';
      button.dataset.question = question;
      button.textContent = question;

      return button;
    }),
  );
}

/* ── กระดานผลงาน ──────────────────────────────────────────── */

export function renderLeaderboard(scores = [], playerName = '') {
  el.leaderboardList.replaceChildren();

  if (scores.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'board__empty';
    empty.textContent = t('board.empty');
    el.leaderboardList.append(empty);
    return;
  }

  const rows = scores.map((score, index) => {
    const row = document.createElement('li');
    row.className = 'board__row';
    row.dataset.top = String(index + 1);
    if (playerName && score.playerName === playerName) row.classList.add('is-mine');

    const rank = document.createElement('span');
    rank.className = 'board__rank';
    rank.textContent = String(index + 1);

    const main = document.createElement('span');
    main.className = 'board__main';

    const name = document.createElement('span');
    name.className = 'board__name';
    name.textContent = score.playerName;

    const meta = document.createElement('span');
    meta.className = 'board__meta';
    meta.textContent = `${score.category} · `;

    const word = document.createElement('span');
    word.className = 'board__word';
    word.textContent = score.secretWord;

    meta.append(word);

    const count = document.createElement('span');
    count.className = 'board__score';
    count.textContent = String(score.questions);

    const unit = document.createElement('small');
    unit.textContent = t('board.unit');

    count.append(unit);

    main.append(name, meta);
    row.append(rank, main, count);
    return row;
  });

  el.leaderboardList.append(...rows);
}

// อัปเดตข้อความที่วาดไว้แล้วให้ตรงกับภาษาปัจจุบัน
export function refreshDynamicText(status, category) {
  if (status) setBadge(status);
  if (category !== undefined) setCategory(category);

  el.transcript.querySelectorAll('.verdict[data-answer]').forEach((chip) => {
    chip.textContent = t(VERDICT_KEYS[chip.dataset.answer] ?? 'verdict.maybe');
  });

  const thinkingText = thinkingNode?.querySelector('.thinking__text');
  if (thinkingText && thinkingNode.dataset.i18nKey) {
    thinkingText.textContent = t(thinkingNode.dataset.i18nKey);
  }
}