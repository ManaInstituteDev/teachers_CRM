import { PrismaClient } from "./src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  const schools = await prisma.school.findMany({
    select: { id: true, name: true, city: true, province: true, district: true }
  });
  console.log(`Total schools: ${schools.length}`);
  console.log(JSON.stringify(schools, null, 2));

  const teachers = await prisma.teacher.findMany({
    select: { id: true, firstName: true, lastName: true, schoolNameManual: true, schoolId: true }
  });
  console.log(`Total teachers: ${teachers.length}`);
  const manualSchools = teachers.map(t => ({
    id: t.id,
    name: `${t.firstName} ${t.lastName}`,
    manual: t.schoolNameManual,
    schoolId: t.schoolId
  }));
  console.log(JSON.stringify(manualSchools, null, 2));
}

run().catch(console.error).finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
