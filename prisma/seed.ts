import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Preparing production database...");

  // ۱. ایجاد یا تضمین وجود کاربر ادمین اصلی سامانه
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: "admin123",
      fullName: "مدیر ارشد سامانه",
      phone: "09120000001",
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log(`Admin user '${admin.username}' verified/created.`);

  // ۲. پاک‌سازی کلیه داده‌های آزمایشی سید (به جز کاربر ادمین)
  console.log("Cleaning test data from database...");

  const delEvals = await prisma.teacherEvaluation.deleteMany({});
  console.log(`- Deleted ${delEvals.count} evaluations.`);

  const delTimesheets = await prisma.timesheetLog.deleteMany({});
  console.log(`- Deleted ${delTimesheets.count} timesheets.`);

  const delReferrers = await prisma.schoolReferrer.deleteMany({});
  console.log(`- Deleted ${delReferrers.count} school referrers.`);

  const delTeachers = await prisma.teacher.deleteMany({});
  console.log(`- Deleted ${delTeachers.count} teachers.`);

  const delSchools = await prisma.school.deleteMany({});
  console.log(`- Deleted ${delSchools.count} schools.`);

  const delAssistants = await prisma.assistantEvaluator.deleteMany({});
  console.log(`- Deleted ${delAssistants.count} assistant evaluators.`);

  const delUsers = await prisma.user.deleteMany({
    where: {
      username: {
        not: "admin",
      },
    },
  });
  console.log(`- Deleted ${delUsers.count} test users (evaluators, etc.).`);

  console.log("Database successfully cleaned. Only admin account remains.");
}

main()
  .catch((e) => {
    console.error("Seed execution failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
