const { Pool } = require("pg");
const fs = require("fs");

const envFile = fs.readFileSync(".env", "utf8");
let dbUrl = "";
for (const line of envFile.split("\n")) {
  if (line.startsWith("DATABASE_URL=")) {
    dbUrl = line.replace("DATABASE_URL=", "").trim().replace(/^["']|["']$/g, "");
  }
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const schoolsRes = await pool.query("SELECT id, name, city, province, district FROM schools ORDER BY name");
  console.log(`Schools count: ${schoolsRes.rows.length}`);
  console.log("Current Schools:", JSON.stringify(schoolsRes.rows, null, 2));

  const teachersRes = await pool.query('SELECT id, "firstName", "lastName", "schoolNameManual", "schoolId" FROM teachers');
  console.log(`Teachers count: ${teachersRes.rows.length}`);
  console.log("Teachers with manual school names:", JSON.stringify(teachersRes.rows, null, 2));
}

main().catch(console.error).finally(() => pool.end());
