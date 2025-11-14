// backend/src/services/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";
//import fetch from "node-fetch";

// ✅ ตรวจสอบ API Key จาก .env หรือใช้ key สำรอง
const apiKey = process.env.GEMINI_API_KEY || "AIzaSyDOVqUOt18TpcgZwqX4qnzLi1AVyunx0gw";
if (!apiKey) {
  throw new Error("❌ GEMINI_API_KEY is not set in .env file");
}

// รายชื่อโมเดลเรียงลำดับความชอบ
const MODEL_PRIORITY = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
];

// สร้าง instance ของ Gemini
const genAI = new GoogleGenerativeAI(apiKey);

// ฟังก์ชันเลือก model ล่าสุด
async function getBestModel() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    const { models } = await res.json();

    for (const name of MODEL_PRIORITY) {
      if (models?.some(m => m.name.includes(name))) return name;
    }
  } catch (err) {
    console.warn("⚠️ Error fetching models:", err);
  }

  // fallback default
  return "gemini-1.5-flash";
}

// ฟังก์ชัน retry อัตโนมัติเมื่อเจอ 503
async function safeGenerate(model, prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (err) {
      if (err.status === 503 && i < retries - 1) {
        console.warn(`⚠️ Model overloaded (attempt ${i + 1}), retrying in 3s...`);
        await new Promise(r => setTimeout(r, 3000));
        continue;
      }
      throw err;
    }
  }
}

export const generateSecretWord = async (userPrompt) => {
  try {
    const modelName = await getBestModel(); // (เรียกใช้ฟังก์ชันสุดล้ำของคุณ)
    const model = genAI.getGenerativeModel({ model: modelName });
    console.log(`🚀 Using model for generating word: ${modelName}`);

    const prompt = `
      You are a game master for a 'Guess the Word' game.
      A user has provided a category: "${userPrompt}"
      
      Your task is to generate ONE single, specific, guessable noun (a person, place, or thing) that fits this category.
      
      Examples:
      - User Category: "easy kitchen items" -> You respond: "Spoon"
      - User Category: "Marvel heroes" -> You respond: "Iron Man"
      - User Category: "สัตว์ปีก" -> You respond: "นกแก้ว"
      
      Respond with ONLY the secret word, and nothing else.
    `;
    
    const result = await safeGenerate(model, prompt); // (เรียกใช้ฟังก์ชัน retry ของคุณ)
    const text = result.response.text().trim();
    
    // (ป้องกัน AI ตอบยาว)
    return text.split('\n')[0]; // (เช่น "กระทะ")

  } catch (error) {
    console.error("❌ Error generating secret word:", error);
    return "Apple"; // Fallback to a default word if AI fails
  }
};

// ฟังก์ชันหลักที่ controller เรียกใช้
export const getAnswer = async (secretCeleb, question) => {
  try {
    const modelName = await getBestModel();
    const model = genAI.getGenerativeModel({ model: modelName });
    console.log(`🚀 Using model: ${modelName}`);

    const prompt = `
      You are a game judge for a 'Guess the Word' game.
      The secret word is: "${secretCeleb}"
      The player asked: "${question}"
      
      Follow these rules:
      1. Your ONLY allowed answers are 'Yes', 'No', or 'Maybe'.
      2. You MUST answer 'Yes' if the player's question *is* the secret word (or a very close match, e.g., 'Lisa' for 'Lisa Blackpink').
      3. For all other questions (clues), answer 'Yes', 'No', or 'Maybe' truthfully based on the secret word.
      
      Respond with only one word:
    `;

    const result = await safeGenerate(model, prompt);
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

export const judgeGuess = async (secretCeleb, guess) => {
  try {
    const modelName = await getBestModel(); // (เรียกใช้ฟังก์ชันสุดล้ำของคุณ)
    const model = genAI.getGenerativeModel({ model: modelName });
    console.log(`🚀 Using model for judging: ${modelName}`);

    const prompt = `
      You are a game judge.
      The secret answer is: "${secretCeleb}"
      The player guessed: "${guess}"
      
      Is this guess correct? Allow for common typos, partial names (e.g., 'Nadech' for 'Nadech Kugimiya'), or names in another language (e.g., 'ลิซ่า' for 'Lisa').
      
      Answer with only one word: 'Yes' or 'No'.
    `;
    
    const result = await safeGenerate(model, prompt); // (เรียกใช้ฟังก์ชัน retry ของคุณ)
    const text = result.response.text().trim().toLowerCase();

    if (text.includes("yes")) return "Yes";
    return "No";

  } catch (error) {
    console.error("❌ Error judging guess:", error);
    return "No"; // Default to "No" (ทายผิด) ถ้า AI judge พัง
  }
};