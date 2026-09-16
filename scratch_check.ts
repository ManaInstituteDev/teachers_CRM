import { prisma } from "./src/lib/prisma";

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

run().catch(console.error).finally(() => process.exit(0));
