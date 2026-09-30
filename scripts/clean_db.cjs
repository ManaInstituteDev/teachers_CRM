const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

function getDbUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
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
  console.error("DATABASE_URL not found in environment or .env file.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: false,
});

async function main() {
  console.log("Starting database cleanup for production...");

  const tables = [
    "teacher_evaluations",
    "timesheet_logs",
    "school_referrers",
    "teachers",
    "schools",
    "assistant_evaluators",
    "users",
  ];

  console.log("Counts before cleanup:");
  for (const t of tables) {
    try {
      const res = await pool.query(`SELECT COUNT(*)::int as count FROM ${t}`);
      console.log(`- ${t}: ${res.rows[0].count}`);
    } catch (e) {
      console.warn(`Could not check table ${t}: ${e.message}`);
    }
  }

  // Delete records in reverse dependency order
  await pool.query("DELETE FROM teacher_evaluations");
  await pool.query("DELETE FROM timesheet_logs");
  await pool.query("DELETE FROM school_referrers");
  await pool.query("DELETE FROM teachers");
  await pool.query("DELETE FROM schools");
  await pool.query("DELETE FROM assistant_evaluators");
  await pool.query("DELETE FROM users WHERE username != 'admin'");

  console.log("\nCounts after cleanup:");
  for (const t of tables) {
    try {
      const res = await pool.query(`SELECT COUNT(*)::int as count FROM ${t}`);
      console.log(`- ${t}: ${res.rows[0].count}`);
    } catch (e) {}
  }

  const adminRes = await pool.query('SELECT id, username, "fullName", role, "isActive" FROM users WHERE username = \'admin\'');
  console.log("\nAdmin user in database:");
  console.log(adminRes.rows);
  console.log("\nDone! Database is clean for production.");
}

main()
  .catch((e) => {
    console.error("Cleanup error:", e.message);
    process.exit(1);
  })
  .finally(() => pool.end());
