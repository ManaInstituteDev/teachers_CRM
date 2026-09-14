import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding initial data...");

  // ۱. ایجاد کاربر ادمین پیش‌فرض
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: "admin123", // در محیط واقعی می‌توان هش کرد
      fullName: "مدیر ارشد سامانه",
      phone: "09120000001",
      role: "ADMIN",
      isActive: true,
    },
  });

  // ۲. ایجاد ارزیاب پیش‌فرض
  const evaluator = await prisma.user.upsert({
    where: { username: "evaluator1" },
    update: {},
    create: {
      username: "evaluator1",
      password: "123456",
      fullName: "دکتر مریم شمس (ارزیاب)",
      phone: "09121111111",
      role: "EVALUATOR",
      isActive: true,
    },
  });

  // ۳. ایجاد مدرسه نمونه با مشخصات کامل شناسنامه (مطابق سند)
  const school1 = await prisma.school.upsert({
    where: { code: "SCH-1001" },
    update: {},
    create: {
      name: "دبیرستان علامه حلی (دوره دوم)",
      code: "SCH-1001",
      province: "تهران",
      city: "تهران",
      district: "منطقه ۶",
      address: "خیابان ولیعصر، نرسیده به میدان فاطمی",
      ownershipType: "SAMPAD",
      admissionType: "EXAM_BASED",
      dominantApproach: "RESEARCH_ORIENTED",
      approachEvidence: "برگزاری سمینارهای منظم مقاله‌نویسی و المپیادهای بین‌رشته‌ای در طول سال تحصیلی",
      humanitiesAttitude: "POSITIVE_SERIOUS",
      humanitiesActivities: [
        "مناظره",
        "سخنرانی و ارائه",
        "روزنامه‌نگاری و نشریه",
        "داستان‌نویسی و روایتگری",
        "گفت‌وگوهای فلسفی",
        "آشنایی با دانشگاه و رشته‌های علوم انسانی"
      ],
      studentCapacities: [
        "تحلیل و استدلال",
        "نوشتن",
        "گفت‌وگو و ارتباط",
        "تفکر انتقادی",
        "روایتگری و تولید محتوا"
      ],
      humanitiesReadinessLevel: "بسیار بالا؛ کادر اجرایی و مدیریت آماده میزبانی و همکاری در کارگاه‌های استعدادیابی هستند.",
      createdById: evaluator.id,
    },
  });

  const school2 = await prisma.school.upsert({
    where: { code: "SCH-1002" },
    update: {},
    create: {
      name: "دبیرستان غیردولتی احسان",
      code: "SCH-1002",
      province: "تهران",
      city: "تهران",
      district: "منطقه ۳",
      address: "خیابان شریعتی، بالاتر از میرداماد",
      ownershipType: "NON_GOVERNMENTAL",
      admissionType: "INTERVIEW_RESUME",
      dominantApproach: "EDUCATIONAL_CULTURAL",
      approachEvidence: "برگزاری کانون‌های فرهنگی و اردوهای آموزشی مستمر",
      humanitiesAttitude: "POSITIVE_LOW_INFO",
      humanitiesActivities: [
        "مناظره",
        "فعالیت‌های مدنی و داوطلبانه",
        "بازدیدهای فرهنگی"
      ],
      studentCapacities: [
        "گفت‌وگو و ارتباط",
        "شناخت مسائل اجتماعی"
      ],
      humanitiesReadinessLevel: "متوسط؛ نیازمند توجیه بیشتر مدیران در حوزه رشته‌های علوم انسانی",
      createdById: evaluator.id,
    },
  });

  // ۴. ایجاد معلمان نمونه
  const teacher1 = await prisma.teacher.upsert({
    where: { nationalCode: "0012345678" },
    update: {},
    create: {
      firstName: "محمد",
      lastName: "صادقی",
      phone: "09122222222",
      nationalCode: "0012345678",
      teachingYears: 12,
      subject: "ادبیات فارسی و نگارش",
      grade: "متوسطه دوم (دهم تا دوازدهم)",
      schoolId: school1.id,
      collaborationStatus: "DEVELOPMENTAL_RELATION",
      bio: "دبیر باسابقه ادبیات و سرپرست انجمن ادبی مدرسه علامه حلی",
    },
  });

  // ۵. ایجاد ارزیابی نمونه کامل (مطابق اوزان و شاخص‌های سند)
  // محور ۱ (۱۵٪): ۲۶ / ۳۰ + ۱۸ / ۲۰ + ۱۹ / ۲۰ + ۲۵ / ۳۰ = ۸۸ -> وزن: ۱۳.۲
  // محور ۲ (۲۵٪): ۲۸ / ۳۰ + ۲۷ / ۳۰ + ۱۸ / ۲۰ + ۱۹ / ۲۰ = ۹۲ -> وزن: ۲۳.۰
  // محور ۳ (۱۵٪): ۳۲ / ۳۵ + ۳۱ / ۳۵ + ۲۶ / ۳۰ = ۸۹ -> وزن: ۱۳.۳۵
  // محور ۴ (۲۵٪): ۳۱ / ۳۵ + ۳۲ / ۳۵ + ۲۷ / ۳۰ = ۹۰ -> وزن: ۲۲.۵
  // محور ۵ (۲۰٪): ۲۶ / ۳۰ + ۱۶ / ۲۰ + ۲۲ / ۲۵ + ۲۲ / ۲۵ = ۸۶ -> وزن: ۱۷.۲
  // نمره نهایی موزون: ۱۳.۲ + ۲۳.۰ + ۱۳.۳۵ + ۲۲.۵ + ۱۷.۲ = ۸۹.۲۵
  const existingEval = await prisma.teacherEvaluation.findFirst({
    where: { teacherId: teacher1.id },
  });

  if (!existingEval) {
    await prisma.teacherEvaluation.create({
      data: {
        teacherId: teacher1.id,
        evaluatorId: evaluator.id,
        dialogueDurationMin: 45,
        familiarityLevel: "HIGH",
        
        // محور ۱
        scoreAxis1_1: 26,
        scoreAxis1_2: 18,
        scoreAxis1_3: 19,
        scoreAxis1_4: 25,
        rawAxis1: 88,
        qualitativeAxis1: "ارتباط تربیتی عمیق و قابل اتکا",
        notesAxis1: "ارتباط بسیار صمیمی و هدایتگر با دانش‌آموزان دارد و بچه‌ها برای تصمیم‌گیری‌های مهم به ایشان رجوع می‌کنند.",

        // محور ۲
        scoreAxis2_1: 28,
        scoreAxis2_2: 27,
        scoreAxis2_3: 18,
        scoreAxis2_4: 19,
        rawAxis2: 92,

        // محور ۳
        scoreAxis3_1: 32,
        scoreAxis3_2: 31,
        scoreAxis3_3: 26,
        rawAxis3: 89,
        qualitativeAxis3: "ظرفیت بالا برای نقش‌آفرینی در هدایت به علوم انسانی",

        // محور ۴
        scoreAxis4_1: 31,
        scoreAxis4_2: 32,
        scoreAxis4_3: 27,
        rawAxis4: 90,
        qualitativeAxis4: "دارای ظرفیت شبکه‌سازی و نقش‌آفرینی منطقه‌ای",

        // محور ۵
        scoreAxis5_1: 26,
        scoreAxis5_2: 16,
        scoreAxis5_3: 22,
        scoreAxis5_4: 22,
        rawAxis5: 86,
        qualitativeAxis5: "آماده پذیرش نقش فعال و مستمر",

        totalWeightedScore: 89.25,
        finalRecommendation: "DEVELOPMENTAL_RELATION",
        finalNotes: "استاد صادقی یکی از گزینه‌های تراز اول برای سرگروهی معلمان علوم انسانی منطقه و منتورینگ دانش‌آموزان مستعد هستند.",
      },
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
