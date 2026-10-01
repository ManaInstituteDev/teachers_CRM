const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

function getDbUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = path.resolve(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf8");
    for (const line of envFile.split("\n")) {
      if (line.trim().startsWith("DATABASE_URL=")) {
        return line.trim().replace("DATABASE_URL=", "").replace(/^["']|["']$/g, "");
      }
    }
  }
  return null;
}

const dbUrl = getDbUrl();
if (!dbUrl) {
  console.error("خطا: متغیر DATABASE_URL در فایل .env یا محیط سیستم یافت نشد.");
  process.exit(1);
}

const isSsl = dbUrl.includes("sslmode=require") || dbUrl.includes("neon.tech");
const pool = new Pool({
  connectionString: dbUrl,
  ssl: isSsl ? { rejectUnauthorized: false } : false,
});

async function main() {
  console.log("در حال بررسی و تنظیم کاربر ادمین در پایگاه‌داده...");

  const username = "admin";
  const password = "admin123";
  const fullName = "مدیر ارشد سامانه";
  const phone = "09120000001";
  const role = "ADMIN";

  const existing = await pool.query(
    'SELECT id, username, "fullName", role, "isActive" FROM users WHERE username = $1',
    [username]
  );

  if (existing.rows.length > 0) {
    const adminUser = existing.rows[0];
    await pool.query(
      'UPDATE users SET password = $1, "fullName" = $2, phone = $3, role = $4, "isActive" = true, "updatedAt" = NOW() WHERE id = $5',
      [password, fullName, phone, role, adminUser.id]
    );
    console.log(`کاربر ادمین موجود به‌روزرسانی شد:`);
    console.log(`- نام کاربری: ${username}`);
    console.log(`- کلمه عبور: ${password}`);
    console.log(`- شناسه: ${adminUser.id}`);
  } else {
    // تولید شناسه cuid ساده یا تصادفی در صورت نبود تابع cuid
    const newId = "admin_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    await pool.query(
      'INSERT INTO users (id, username, password, "fullName", phone, role, "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())',
      [newId, username, password, fullName, phone, role]
    );
    console.log(`کاربر ادمین جدید ایجاد شد:`);
    console.log(`- نام کاربری: ${username}`);
    console.log(`- کلمه عبور: ${password}`);
    console.log(`- شناسه: ${newId}`);
  }

  console.log("\nثبت سید ادمین با موفقیت انجام شد.");
}

main()
  .catch((err) => {
    console.error("خطا در ایجاد ادمین:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
