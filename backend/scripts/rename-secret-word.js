// backend/scripts/rename-secret-word.js
// ย้ายข้อมูลเกมเก่าที่ยังใช้ชื่อ field "secretCeleb" ไปเป็น "secretWord"
// รันครั้งเดียวหลังอัปเดตโค้ด:  node backend/scripts/rename-secret-word.js

import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!uri) {
  console.error('❌ ไม่พบ MONGODB_URI ในไฟล์ .env');
  process.exit(1);
}

await mongoose.connect(uri);

const result = await mongoose.connection
  .collection('games')
  .updateMany(
    { secretCeleb: { $exists: true } },
    { $rename: { secretCeleb: 'secretWord' } },
  );

console.log(`อัปเดตเกม ${result.modifiedCount} รายการ`);
console.log(
  'เกมที่ค้างอยู่ (เกมที่ผู้เล่นทิ้งค้างไว้ ไม่ได้เล่นจบ):',
  await mongoose.connection.collection('games').countDocuments(),
);

await mongoose.disconnect();