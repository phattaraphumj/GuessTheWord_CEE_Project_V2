// frontend/public/scripts/i18n.js
// ภาษาอังกฤษคือค่าเริ่มต้น สลับเป็นไทยได้จากเมนูมุมขวาบน

const STORAGE_KEY = 'gtw.lang';
const DEFAULT_LANG = 'en';

const DICT = {
  en: {
    'meta.title': 'Guess It — 20 Questions Against an AI',
    'meta.description':
      'A 20-questions guessing game. The AI hides one word, you can only ask yes/no questions.',

    'brand.text': 'Guess It',

    'hero.eyebrow': 'A 20-questions game',
    'hero.title1': 'The AI hides one word.',
    'hero.title2': 'You get 20 questions.',
    'hero.lede':
      'Pick a category and the AI hides one word from it. Every question you ask gets exactly one of three answers.',
    'verdict.yes': 'Yes',
    'verdict.no': 'No',
    'verdict.maybe': 'Maybe',

    'panel.nameLabel': 'Your name on the board',
    'panel.namePlaceholder': 'e.g. Alex',
    'panel.categoryTitle': 'Pick a category',
    'panel.categoryHint': 'Tap a category, or type your own below.',
    'panel.customLabel': 'Or type your own',
    'panel.customPlaceholder': 'e.g. Kitchen items, Marvel heroes, Birds',
    'btn.start': 'Start game',
    'btn.starting': 'Starting…',

    'how.1': 'The AI hides one word from the category you chose.',
    'how.2': 'Ask yes/no questions — the AI answers Yes, No, or Maybe.',
    'how.3': 'Guess when you are sure, or surrender to see the word.',

    'board.title': 'Leaderboard',
    'board.hint': 'Fewer questions means a higher rank.',
    'board.empty': 'No wins yet — be the first.',
    'board.unit': 'qs',

    'badge.playing': 'Playing',
    'badge.won': 'Solved',
    'badge.surrendered': 'Gave up',
    'category.label': 'Category: {name}',

    'gauge.label': 'Questions used',

    'btn.restart': 'New game',
    'btn.restartArmed': 'Click again to restart',
    'btn.surrender': 'Give up',
    'btn.surrenderArmed': 'Click again to reveal',

    'quick.label': 'Quick yes/no questions',
    'transcript.label': 'Transcript of your questions',
    'question.placeholder': 'Ask a yes/no question, e.g. Is it red?',
    'btn.ask': 'Ask',
    'guess.placeholder': 'Guess the word',
    'btn.submitGuess': 'Submit guess',

    'reveal.won': 'Correct',
    'reveal.reveal': 'The word was',
    'reveal.metaWin': 'Solved in {n} questions',
    'reveal.metaLose': '{n} questions, then gave up',
    'btn.playAgain': 'Play again',

    'note.started': 'The word is hidden. Start asking.',
    'note.restored': 'Picking up where you left off.',
    'note.wrongGuess': '“{guess}” — not it',
    'note.aiUnavailable': 'The AI could not answer just now. Try again in a moment.',

    'thinking.thinking': 'The AI is thinking…',
    'thinking.picking': 'The AI is picking a word…',
    'thinking.revealing': 'Opening the answer…',
    'thinking.clearing': 'Clearing the old game…',

    'error.emptyCategory': 'Type a category, or tap one above.',
    'error.network': 'Cannot reach the server. Check that the backend is running on port 3222.',
    'error.server': 'The server returned an error ({status}).',

    'lang.toggle': 'Language',

    categories: [
      'Animals',
      'Kitchen items',
      'Vehicles',
      'Thai fruits',
      'Musical instruments',
      'Travel places',
      'Technology',
      'Thai food',
      'Celebrities',
      'Sports',
    ],

    quickQuestions: [
      'Is it alive?',
      'Is it an animal?',
      'Is it found indoors?',
      'Is it used every day?',
      'Does it need electricity?',
    ],
  },

  th: {
    'meta.title': 'ทายคำ — คุยกับ AI เพื่อเดาคำลับ',
    'meta.description':
      'เกมทายคำสไตล์ 20 คำถาม AI ซ่อนคำลับไว้หนึ่งคำ คุณมีแค่คำถามใช่ ไม่ใช่',

    'brand.text': 'ทายคำ',

    'hero.eyebrow': 'เกมทายคำ 20 คำถาม',
    'hero.title1': 'AI เลือกคำลับมาเอง',
    'hero.title2': 'ที่เหลือคือคำถามของคุณ',
    'hero.lede':
      'เลือกหมวดที่อยากทาย AI จะสุ่มคำหนึ่งคำจากหมวดนั้น แล้วทุกคำถามได้คำตอบแค่สามคำตอบ',
    'verdict.yes': 'ใช่',
    'verdict.no': 'ไม่ใช่',
    'verdict.maybe': 'อาจจะ',

    'panel.nameLabel': 'ชื่อที่จะขึ้นกระดาน',
    'panel.namePlaceholder': 'เช่น ต้น',
    'panel.categoryTitle': 'เลือกหมวดที่จะทาย',
    'panel.categoryHint': 'กดหมวดที่ถูกใจ หรือพิมพ์หมวดของคุณเอง',
    'panel.customLabel': 'หรือพิมพ์หมวดเอง',
    'panel.customPlaceholder': 'เช่น ของใช้ในครับ, หนัง Marvel, สัตว์ปีก',
    'btn.start': 'เริ่มเกม',
    'btn.starting': 'กำลังเริ่ม…',

    'how.1': 'AI ซ่อนคำลับหนึ่งคำจากหมวดที่เลือก',
    'how.2': 'ถามเป็นคำถามใช่/ไม่ใช่ AI ตอบได้สามคำตอบ',
    'how.3': 'เดาคำเมื่อมั่นใจ หรือกดยอมแพ้เพื่อดูเฉลย',

    'board.title': 'กระดานผลงาน',
    'board.hint': 'ยิ่งใช้คำถามน้อย ยิ่งขึ้นอันดับสูง',
    'board.empty': 'ยังไม่มีใครทายถูก — ลองเป็นคนแรกดู',
    'board.unit': 'คำถาม',

    'badge.playing': 'กำลังเล่น',
    'badge.won': 'ชนะแล้ว',
    'badge.surrendered': 'ยอมแพ้',
    'category.label': 'หมวด: {name}',

    'gauge.label': 'คำถามที่ใช้ไป',

    'btn.restart': 'เริ่มใหม่',
    'btn.restartArmed': 'กดอีกครั้งเพื่อเริ่มใหม่',
    'btn.surrender': 'ยอมแพ้',
    'btn.surrenderArmed': 'กดอีกครั้งเพื่อดูเฉลย',

    'quick.label': 'คำถามใช่/ไม่ใช่ที่ใช้บ่อย',
    'transcript.label': 'บันทึกคำถามที่คุณถามไปแล้ว',
    'question.placeholder': 'ถามคำถามที่ใช่/ไม่ใช่ เช่น มีสีขาวไหม',
    'btn.ask': 'ถาม',
    'guess.placeholder': 'เดาคำลับของคุณ',
    'btn.submitGuess': 'ส่งคำตอบ',

    'reveal.won': 'ถูกต้อง',
    'reveal.reveal': 'เฉลยคือ',
    'reveal.metaWin': 'ใช้ไป {n} คำถาม',
    'reveal.metaLose': 'ใช้ไป {n} คำถามแล้วยอมแพ้',
    'btn.playAgain': 'เล่นอีกครั้ง',

    'note.started': 'AI ซ่อนคำลับไว้แล้ว ถามได้เลย',
    'note.restored': 'เกมที่ค้างไว้จากรอบก่อน ถามต่อได้เลย',
    'note.wrongGuess': 'ทายว่า “{guess}” — ยังไม่ใช่',
    'note.aiUnavailable': 'AI ยังตอบไม่ได้ตอนนี้ ลองอีกครั้งในอีกสักครู่',

    'thinking.thinking': 'AI กำลังคิด…',
    'thinking.picking': 'AI กำลังเลือกคำลับ…',
    'thinking.revealing': 'กำลังเปิดเฉลย…',
    'thinking.clearing': 'กำลังล้างเกมเก่า…',

    'error.emptyCategory': 'พิมพ์หมวดที่อยากทาย หรือกดหมวดจากรายการด้านบน',
    'error.network': 'ติดต่อเซิร์ฟเวอร์ไม่ได้ ตรวจว่า backend กำลังรันอยู่ที่ port 3222',
    'error.server': 'เซิร์ฟเวอร์ตอบกลับผิดพลาด ({status})',

    'lang.toggle': 'ภาษา',

    categories: [
      'สัตว์',
      'ของใช้ในครับ',
      'ยานพาหนะ',
      'ผลไม้ไทย',
      'เครื่องดนตรี',
      'สถานที่ท่องเที่ยว',
      'เทคโนโลยี',
      'อาหารไทย',
      'ดารา',
      'กีฬา',
    ],

    quickQuestions: [
      'เป็นสิ่งมีชีวิตหรือไม่?',
      'เป็นสัตว์หรือไม่?',
      'อยู่ในบ้านหรือไม่?',
      'เป็นของที่ใช้ทุกวันหรือไม่?',
      'ต้องใช้ไฟฟ้าหรือไม่?',
    ],
  },
};

const listeners = new Set();

export function getLang() {
  return localStorage.getItem(STORAGE_KEY) === 'th' ? 'th' : DEFAULT_LANG;
}

export function setLang(lang) {
  const next = lang === 'th' ? 'th' : DEFAULT_LANG;
  localStorage.setItem(STORAGE_KEY, next);
  applyLang(next);
  listeners.forEach((fn) => fn(next));
}

// แทนที่ {placeholder} ในข้อความ (คีย์ที่เป็นรายการ เช่น categories จะคืนค่าเป็น array)
export function t(key, vars = {}) {
  const lang = getLang();
  const value = DICT[lang][key] ?? DICT[DEFAULT_LANG][key] ?? key;

  if (typeof value !== 'string') return value;

  return value.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');
}

// อัปเดตทุก element ที่มี data-i18n รวมถึง title/placeholder ของ document
export function applyLang(lang = getLang()) {
  document.documentElement.lang = lang;

  document.title = t('meta.title');

  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', t('meta.description'));

  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
    node.setAttribute('aria-label', t(node.dataset.i18nAriaLabel));
  });
}

export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}