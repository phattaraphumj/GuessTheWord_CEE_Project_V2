// backend/src/services/geminiService.js
import { randomInt } from "node:crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";
//import fetch from "node-fetch";

// ✅ ต้องมี API Key จาก .env เท่านั้น (ห้าม hardcode ในโค้ดเด็ดขาด)
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("❌ GEMINI_API_KEY is not set in .env file");
}

// รายชื่อโมเดลเรียงลำดับความชอบ (ใหม่สุด → เก่าสุด)
// ⚠️ ใช้เฉพาะโมเดล Free Tier ของ Google AI Studio เท่านั้น
//    (ตั้งแต่ 1 เม.ย. 2026 โมเดลตระกูล Pro ถูกย้ายไปเป็นแบบเสียเงินแล้ว
//     free tier เหลือเฉพาะ Flash / Flash-Lite)
//    โมเดลใหม่ ๆ อาจยังไม่อยู่ใน free tier ของทุกโปรเจกต์ ระบบจะลองทีละตัว
//    แล้ว fallback ไปตัวถัดไปอัตโนมัติเมื่อเจอ 429/404
const MODEL_PRIORITY = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
];

// สร้าง instance ของ Gemini
const genAI = new GoogleGenerativeAI(apiKey);

// ตั้งค่าโมเดลเองได้ผ่าน .env (ข้ามการตรวจรายชื่อโมเดลให้อัตโนมัติ)
let preferredModel = process.env.GEMINI_MODEL || null;
let availableModels = null;
let activeModel = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ดึงรายชื่อโมเดลที่คีย์นี้เรียกใช้ได้ (cache ไว้ครั้งเดียวต่อ process เพื่อไม่เผาโควตา)
async function loadAvailableModels() {
  if (availableModels) return availableModels;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
    );
    const { models } = await res.json();
    availableModels = new Set(
      (models ?? []).map((m) => m.name.replace(/^models\//, "")),
    );
  } catch (err) {
    console.warn("⚠️ Error fetching models:", err);
    availableModels = null;
  }
  return availableModels;
}

// เรียงลำดับโมเดลที่จะลอง: ตัวที่เคยใช้ได้ก่อน → ตาม MODEL_PRIORITY
async function candidateModels() {
  const available = await loadAvailableModels();
  const ordered = preferredModel
    ? [preferredModel, ...MODEL_PRIORITY.filter((m) => m !== preferredModel)]
    : [...MODEL_PRIORITY];

  return available
    ? ordered.filter((name) => available.has(name))
    : ordered;
}

// ยิงไปยัง Gemini: ลองทีละโมเดลในลิสต์, retry เมื่อเจอโควตาหมด/เครื่องหนัก
async function safeGenerate(prompt, retries = 2) {
  const candidates = await candidateModels();
  let lastError;

  for (const name of candidates) {
    const model = genAI.getGenerativeModel({ model: name });

    for (let i = 0; i < retries; i++) {
      try {
        const result = await model.generateContent(prompt);
        if (activeModel !== name) {
          activeModel = name;
          preferredModel = name;
          console.log(`🚀 Using model: ${name}`);
        }
        return result;
      } catch (err) {
        lastError = err;

        // โมเดลนี้ไม่มีในบัญชีนี้ → ข้ามไปตัวถัดไปทันที
        if (err.status === 404) {
          console.warn(`⚠️ ${name} not available for this API key, trying next...`);
          break;
        }

        // 429 = โควตาหมด, 503 = เครื่องหนัก → retry แล้วข้ามไปโมเดลถัดไป
        if (err.status === 429 || err.status === 503) {
          if (i < retries - 1) {
            const waitMs = 3000 * 2 ** i;
            console.warn(
              `⚠️ ${name} returned ${err.status} (attempt ${i + 1}/${retries}), retrying in ${waitMs / 1000}s...`,
            );
            await sleep(waitMs);
            continue;
          }
          console.warn(
            `⚠️ ${name} unavailable (${err.status}), falling back to next free model...`,
          );
          break;
        }

        throw err;
      }
    }
  }

  throw lastError;
}

// จำนวนคำที่ให้ AI คิดมา (ต้องมากกว่า POOL_SIZE เพื่อให้สุ่มได้หลากหลาย)
const CANDIDATE_COUNT = 40;

// ระดับความยาก: 1 = สุ่มได้ทั้ง pool, 2 = ข้ามคำที่คนรู้จักดีที่สุด, 3 = เอาเฉพาะท้าย pool
const GAME_DIFFICULTY = Number(process.env.GAME_DIFFICULTY) || 2;

// จำนวนคำใน pool ของเกมหนึ่งรอบ (คำลับจะหยิบมาจากในนี้ และผู้เล่นเห็นทั้งหมด)
const POOL_SIZE = 30;

// แปลงคำตอบของ AI ให้เป็น array ของคำที่สะอาด
function parseCandidateList(raw, count) {
  const text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;

  let items = [];
  const arrayMatch = body.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) items = parsed;
    } catch {
      items = [];
    }
  }

  // ถ้าไม่ใช่ JSON ให้ถอยไปอ่านทีละบรรทัด (กันกรณี AI ตอบเป็นรายการข้อความ)
  if (items.length === 0) {
    items = body.split(/[\n\r]+/);
  }

  const cleaned = [];
  const seen = new Set();
  for (const item of items) {
    const value = String(item)
      .replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "")
      .replace(/^["']|["']$/g, "")
      .trim();
    if (!value || value.length > 40) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    cleaned.push(value);
  }

  // ตัดคำที่ "ยัด" คำอื่นในรายการทิ้ง เช่น ถ้ามีทั้ง "ค้างคาว" และ "ค้างคาวแม่ไก่"
  // เพราะคำแบบหลังคือการเอาสองของมาต่อกัน ซึ่งไม่มีอยู่จริง
  const real = cleaned.filter((word) =>
    !cleaned.some((other) => other !== word && word.includes(other)),
  );

  return (real.length >= 6 ? real : cleaned).slice(0, count);
}

// สุ่ม pool ขนาด fixed จากรายชื่อที่ AI คืนมา (สลับแบบ Fisher-Yates เพื่อไม่ให้เรียงตามเดิมทุกครั้ง)
function samplePool(candidates, size = POOL_SIZE) {
  const shuffled = [...candidates];
  const take = Math.min(size, shuffled.length);

  for (let i = 0; i < take; i++) {
    const j = i + randomInt(shuffled.length - i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, take);
}

// เลือกคำลับจาก pool โดยเลี่ยงคำที่คนรู้จักดีที่สุด ตามระดับความยาก
function pickSecretWord(pool) {
  if (pool.length <= 1) return pool[0];

  const startRatio = { 1: 0, 2: 0.4, 3: 0.75 }[GAME_DIFFICULTY] ?? 0;
  const start = Math.floor(pool.length * startRatio);
  const narrowed = pool.slice(start);

  return narrowed[randomInt(narrowed.length)];
}

// เดาภาษาจากหมวดที่ผู้เล่นพิมพ์: มีตัวอักษรไทย = ไทย, ไม่มี = อังกฤษ
const detectLanguage = (text) => (/[฀-๿]/.test(text) ? "Thai" : "English");

export const generateCandidates = async (
  userPrompt,
  count = CANDIDATE_COUNT,
) => {
  const language = detectLanguage(userPrompt);

  const prompt = `
    You are a game master for a 'Guess the Word' game.
    The player chose this category: "${userPrompt}"

    List ${count} DIFFERENT items that belong to that category.

    Rules:
    1. Order them from the most well-known item to the least well-known item.
    2. All ${count} items must be different from each other.
    3. Write every item in ${language}. This is the most important rule — do not mix languages.
    4. Each entry is ONE single item. Never glue two items together —
       write "Spoon", never "Spoon Knife"; write "ค้างคาว", never "ค้างคาวแม่ไก่".
    5. Every item must be a real, commonly used ${language} word — no invented or compound nonsense.
    6. Each item must be 1-2 words, a concrete noun, no brands and no model names.
    7. Every item must be something an average person would recognise.
    8. Name the actual object - never a generic word such as "stuff", "device", "ของใช้" or "อุปกรณ์".

    Respond with ONLY a JSON array of ${count} strings, nothing else.

    Format examples (copy the FORMAT only, never the items):
    English category -> ["Iron Man", "Thor", "Hulk", "Spider-Man", "Black Widow"]
    Thai category -> ["นกแก้ว", "นกกระเรียน", "อินทรี", "นกเหยี่ยว", "นกฟูก"]
  `;

  const result = await safeGenerate(prompt);
  return parseCandidateList(result.response.text(), count);
};

export const generateSecretWord = async (userPrompt, count) => {
  try {
    const candidates = await generateCandidates(userPrompt, count);
    if (candidates.length === 0) {
      throw new Error("AI returned an empty candidate list");
    }

    const pool = samplePool(candidates);
    const secretWord = pickSecretWord(pool);

    console.log(`🎲 Pool (${pool.length}): ${pool.join(", ")}`);
    console.log(`🔒 Secret word: ${secretWord}`);

    return { secretWord, candidates: pool };
  } catch (error) {
    console.error("❌ Error generating secret word:", error?.message ?? error);
    return { secretWord: "Apple", candidates: ["Apple"] };
  }
};

// ฟังก์ชันหลักที่ controller เรียกใช้
export const getAnswer = async (secretWord, question) => {
  try {
    const prompt = `
      You are a game judge for a 'Guess the Word' game.
      The secret word is: "${secretWord}"
      The player asked: "${question}"
      
      Follow these rules:
      1. Your ONLY allowed answers are 'Yes', 'No', or 'Maybe'.
      2. You MUST answer 'Yes' if the player's question *is* the secret word (or a very close match, e.g., 'Lisa' for 'Lisa Blackpink').
      3. For all other questions (clues), answer 'Yes', 'No', or 'Maybe' truthfully based on the secret word.
      
      Respond with only one word:
    `;

    const result = await safeGenerate(prompt);
    const text = result.response.text().trim().toLowerCase();

    if (text.includes("yes")) return "Yes";
    if (text.includes("no")) return "No";
    if (text.includes("maybe")) return "Maybe";

    // fallback default
    return "Maybe";
  } catch (error) {
    console.error("❌ Error contacting Gemini:", error);
    return "err";
  }
};

const normalizeWord = (value) => value.trim().toLowerCase().replace(/\s+/g, " ");

// คำที่ "ต่างจากคำลับชัดเจนเกินกว่าจะเป็นแค่พิมพ์ผิด" → ตัดสินว่าผิดทันทีโดยไม่ต้องถาม AI
// เช่น คำลับ "ไก่" แต่ผู้เล่นเดา "แม่ไก่" (คำขยายความ) หรือ "chickens" กับ "chicken"
function isTooFarFromSecret(guess, secretWord) {
  const g = normalizeWord(guess);
  const s = normalizeWord(secretWord);

  if (!g || !s) return true;
  if (g === s) return false;

  // ยาวต่างกันเกิน 1 ตัวอักษร = คนละคำ ไม่ใช่พิมพ์ผิด
  if (Math.abs(g.length - s.length) > 1) return true;

  // ฝั่งหนึ่งเป็นคำเดียว อีกฝั่งเป็นวลี = คำขยายความ
  if (g.includes(" ") !== s.includes(" ")) return true;

  return false;
}

export const judgeGuess = async (secretWord, guess, pool = []) => {
  // กรณีชัดเจนว่าไม่ใช่คำเดียวกัน ปฏิเสธเลย ประหยัดโควตา AI ด้วย
  if (isTooFarFromSecret(guess, secretWord)) {
    console.log(`🚫 "${guess}" ต่างจากคำลับ "${secretWord}" เกินกว่าจะเป็นพิมพ์ผิด`);
    return "No";
  }

  try {
    const poolHint =
      pool.length > 0 ? `\nThe hidden word is exactly one of these: ${pool.join(", ")}` : "";

    const prompt = `
      You are a game judge.
      The secret answer is: "${secretWord}"${poolHint}
      The player guessed: "${guess}"

      Say 'Yes' ONLY when the guess means the SAME single word as the secret answer.
      Accept small typos, a missing or extra accent, and the same word written in another
      alphabet or language ('Khi' or 'Kai' for 'ไก่', 'Lemon' for 'มะนาว').

      Say 'No' when:
      - the guess is a different word from the same category
      - the guess is only a part of the secret word
      - the guess is the secret word with extra words attached, for example 'แม่ไก่' for 'ไก่'
        or 'mother hen' for 'hen' — extra words make it a different word
      - the guess is a longer form of the same thing, for example 'chickens' for 'chicken'

      Answer with only one word: 'Yes' or 'No'.
    `;

    const result = await safeGenerate(prompt);
    const text = result.response.text().trim().toLowerCase();

    if (text.includes("yes")) return "Yes";
    return "No";
  } catch (error) {
    console.error("❌ Error judging guess:", error);
    return "No"; // Default to "No" (ทายผิด) ถ้า AI judge พัง
  }
};