# 🎮 เกมทายคำ (Gemini-Powered Guess the Word)

นี่คือโปรเจกต์เว็บเกมทายคำ (สไตล์ 20 คำถาม) ที่ผู้เล่นจะต้องทายคำปริศนาที่ AI สร้างขึ้น โดยการถามคำถาม "ใช่/ไม่ใช่"

ตัว Backend ขับเคลื่อนด้วย **Google Gemini API** ที่ทำหน้าที่ทั้งสร้างคำปริศนาตาม "หมวดหมู่" (Prompt) ที่ผู้เล่นกำหนด และทำหน้าที่ตอบคำถาม "ใช่/ไม่ใช่" ของผู้เล่น

## ✨ คุณสมบัติ (Features)

* **สร้างคำปริศนาจาก Prompt:** ผู้เล่นสามารถกำหนดหมวดหมู่ (เช่น "ของใช้ในครัว", "สัตว์ปีก") เพื่อให้ AI สร้างคำปริศนา
* **ระบบถาม-ตอบ AI:** ถามคำถาม "ใช่/ไม่ใช่" แล้ว Gemini API จะวิเคราะห์และตอบกลับ
* **ระบบทายคำ:** ผู้เล่นสามารถส่ง "คำทาย" (Guess) เพื่อจบเกมได้
* **ระบบยอมแพ้:** ผู้เล่นสามารถกด "ยอมแพ้" (Surrender) เพื่อดูเฉลยได้ทันที
* **Dynamic UI:**
    * หน้าจอจะอัปเดตสถานะเกม (Playing, Won, Surrendered)
    * แถบข้อมูล (Game State, Word) จะเปลี่ยนเป็น **สีเขียว** เมื่อชนะ และ **สีแดง** เมื่อยอมแพ้
    * Log คำถาม/คำตอบ จะเปลี่ยนเป็น **สีเขียว** (ทายถูก) และ **สีแดง** (ทายผิด/Error)

---

## 🔧 เทคโนโลยีที่ใช้ (Tech Stack)

### 🔵 Backend

* **Node.js**
* **Express.js** (สำหรับจัดการ API)
* **MongoDB** (กับ Mongoose) (สำหรับเก็บสถานะเกมและประวัติการถาม)
* **Google Gemini API** (`@google/generative-ai`) (สำหรับตรรกะหลักของเกม)
* **Dotenv** (สำหรับจัดการ Environment Variables)

### 🟢 Frontend

* **HTML5**
* **CSS3** (Vanilla)
* **JavaScript (ES Modules)** (Vanilla JS)
* **Fetch API** (สำหรับสื่อสารกับ Backend)
* **Express.js** (สำหรับเสิร์ฟไฟล์ Frontend)

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

โปรเจกต์นี้แบ่งโค้ดออกเป็น 2 ส่วนหลัก: `backend` และ `frontend` แต่ใช้ **`package.json` ตัวเดียวที่รากโปรเจกต์** (ติดตั้ง dependency ครั้งเดียว)

โครงสร้างไฟล์:

```text
├── package.json          ← dependency + scripts ของทั้งโปรเจกต์ (ติดตั้งและรันจากตรงนี้)
├── package-lock.json
├── .env                  ← ไฟล์นี้ต้องอยู่ที่รากโปรเจกต์ (dotenv อ่านจากโฟลเดอร์ที่รันคำสั่ง)
├── .env.template
└── .nvmrc
```

---

## 🚀 วิธีการรันโปรเจกต์ (Installation & Usage)

คุณต้องรัน Server 2 ตัวพร้อมกัน (Backend และ Frontend) แต่ติดตั้ง dependency เพียงครั้งเดียวที่รากโปรเจกต์

### 1. การตั้งค่า Backend (Port 3222)

1.  **ติดตั้ง Dependencies (ที่รากโปรเจกต์):**
    ```bash
    npm install
    ```
2.  **สร้างไฟล์ `.env`:**
    คัดลอกไฟล์ `.env.template` เป็น `.env` **ที่รากโปรเจกต์** แล้วใส่ค่าตัวแปรดังนี้:
    ```env
    # ลิงก์เชื่อมต่อ MongoDB (เช่น จาก Atlas หรือ Local)
    MONGO_URI="your_mongodb_connection_string"

    # API Key ของคุณจาก Google AI Studio
    GEMINI_API_KEY="your_gemini_api_key"

    # Port ที่ Backend จะรัน
    PORT_BACKEND=3222
    ```
3.  **รัน Backend Server:**
    ```bash
    npm run start:backend
    ```
    (Backend ควรจะรันที่ `http://localhost:3222`)

### 2. การตั้งค่า Frontend (Port 3221)

1.  **เปิด Terminal ใหม่** (อย่าปิด Terminal ของ Backend)
2.  **รัน Frontend Server** (รันจากรากโปรเจกต์):
    ```bash
    npm run start:frontend
    ```
    (Frontend ควรจะรันที่ `http://localhost:3221`)

3.  **เปิดเล่นเกม:**
    เข้าเบราว์เซอร์แล้วไปที่ **`http://localhost:3221`**

> 💡 ถ้าต้องการรันทั้งสองเซิร์ฟเวอร์พร้อมกันในคำสั่งเดียว ใช้ `npm run dev`
> (ทั้งสองคำสั่งใช้ `node --watch` จึงรีสตาร์ทอัตโนมัติเมื่อแก้โค้ด)

---

## 🧭 API Endpoints (Backend)

* `POST /api/game/new`
    * สร้างเกมใหม่ (รับ `categoryPrompt` จาก body)
* `GET /api/game/:id`
    * ดึงข้อมูลเกม (สถานะ, ประวัติ)
* `POST /api/game/:id/ask`
    * ส่งคำถาม (รับ `question` จาก body)
* `POST /api/game/:id/guess`
    * ส่งคำทาย (รับ `guess` จาก body)
* `DELETE /api/game/:id`
    * ลบเกม (ใช้เมื่อชนะหรือยอมแพ้)