import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding initial data...");

  // ۱. ایجاد کاربر ادمین پیش‌فرض
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

  // ۲. ایجاد ارزیاب‌های پیش‌فرض
  const evaluator1 = await prisma.user.upsert({
    where: { username: "evaluator1" },
    update: {},
    create: {
      username: "evaluator1",
      password: "123456",
      fullName: "دکتر مریم شمس",
      phone: "09121111111",
      role: "EVALUATOR",
      isActive: true,
    },
  });

  const evaluator2 = await prisma.user.upsert({
    where: { username: "evaluator2" },
    update: {},
    create: {
      username: "evaluator2",
      password: "123456",
      fullName: "مهندس علیرضا سلیمانی",
      phone: "09122222222",
      role: "EVALUATOR",
      isActive: true,
    },
  });

  // ۳. ایجاد کمک‌ارزیاب‌ها و اتصال آنها به ارزیاب‌ها
  const assistant1 = await prisma.assistantEvaluator.create({
    data: {
      fullName: "حسین رضایی",
      phone: "09351234567",
      nationalCode: "0012345678",
      notes: "کمک‌ارزیاب فعال در مناطق ۳ و ۶ آموزش و پرورش",
      evaluatorId: evaluator1.id,
    },
  });

  const assistant2 = await prisma.assistantEvaluator.create({
    data: {
      fullName: "فاطمه کریمی",
      phone: "09367891234",
      nationalCode: "0023456789",
      notes: "کمک‌ارزیاب مصاحبه‌ها و بررسی سوابق مدارک معلمان",
      evaluatorId: evaluator1.id,
    },
  });

  const assistant3 = await prisma.assistantEvaluator.create({
    data: {
      fullName: "سجاد ابراهیمی",
      phone: "09123456780",
      nationalCode: "0034567890",
      notes: "کمک‌ارزیاب منطقه ۱ و بررسی میدانی مدارس",
      evaluatorId: evaluator2.id,
    },
  });

  // ۴. ایجاد مدارس نمونه
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
      approachEvidence: "برگزاری سمینارهای منظم مقاله‌نویسی و المپیادهای بین‌رشته‌ای",
      humanitiesAttitude: "POSITIVE_SERIOUS",
      humanitiesActivities: [
        "مناظره",
        "سخنرانی و ارائه",
        "روزنامه‌نگاری و نشریه",
        "گفت‌وگوهای فلسفی",
        "آشنایی با دانشگاه و رشته‌های علوم انسانی",
      ],
      studentCapacities: [
        "تحلیل و استدلال",
        "نوشتن",
        "گفت‌وگو و ارتباط",
        "تفکر انتقادی",
        "روایتگری و تولید محتوا",
      ],
      humanitiesReadinessLevel: "بسیار بالا؛ کادر اجرایی آماده میزبانی و همکاری فعال است.",
      principalName: "دکتر مسعود رضایی",
      phone: "021-66554433",
      notes: "مدرسه دارای کانون فعال شعر و مناظره دانش‌آموزی است.",
      createdById: evaluator1.id,
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
      humanitiesActivities: ["مناظره", "فعالیت‌های مدنی و داوطلبانه", "بازدیدهای فرهنگی"],
      studentCapacities: ["گفت‌وگو و ارتباط", "شناخت مسائل اجتماعی"],
      humanitiesReadinessLevel: "متوسط؛ نیازمند توجیه بیشتر مدیران در حوزه رشته‌های علوم انسانی",
      principalName: "مهندس علیرضا کیانی",
      phone: "021-22334455",
      notes: "هماهنگی‌های اولیه با معاون پرورشی انجام شده است.",
      createdById: evaluator1.id,
    },
  });

  // ۵. ایجاد معلمان با سطوح ۴ گانه همکاری (محور، مستعد، موردی، نامناسب)
  // معلم ۱: سطح «محور» (KEY_AXIS - بالای ۸۰٪)
  const teacher1 = await prisma.teacher.create({
    data: {
      firstName: "سید محمد",
      lastName: "حسینی",
      phone: "09121112233",
      nationalCode: "0011111111",
      teachingYears: 14,
      roleTitle: "معلم",
      subject: "ادبیات فارسی و نگارش",
      grade: "متوسطه دوم (دهم و یازدهم)",
      schoolId: school1.id,
      collaborationStatus: "KEY_AXIS",
      bio: "دبیر باسابقه المپیاد ادبی، دارای حلقه فعال پژوهشی و هدایت تحصیلی دانش‌آموزان به رشته علوم انسانی.",
      evaluations: {
        create: {
          evaluatorId: evaluator1.id,
          dialogueDurationMin: 60,
          familiarityLevel: "HIGH",

          // محور ۱: رابطه تربیتی (سقف ۵۰ - نمره: ۴۶)
          scoreAxis1_1: 28,
          scoreAxis1_2: 18,
          rawAxis1: 46,
          qualitativeAxis1: "ارتباط تربیتی عمیق و قابل اتکا",
          notesAxis1: "دانش‌آموزان در خارج از ساعات مدرسه جهت مشاوره فلسفی و فردی به وی مراجعه می‌کنند.",

          // محور ۲: شناسایی استعداد (سقف ۸۰ - نمره: ۷۴)
          scoreAxis2_1: 28,
          scoreAxis2_2: 28,
          scoreAxis2_3: 18,
          rawAxis2: 74,
          qualitativeAxis2: "توان بسیار بالا در شناسایی استعداد فراتر از نمره",

          // محور ۳: نگرش علوم انسانی (سقف ۱۰۰ - نمره: ۹۵)
          scoreAxis3_1: 34,
          scoreAxis3_2: 33,
          scoreAxis3_3: 28,
          rawAxis3: 95,
          qualitativeAxis3: "ظرفیت بالا برای نقش‌آفرینی در هدایت به علوم انسانی",

          // محور ۴: سرمایه ارتباطی (سقف ۱۰۰ - نمره: ۹۲)
          scoreAxis4_1: 33,
          scoreAxis4_2: 33,
          scoreAxis4_3: 26,
          rawAxis4: 92,
          qualitativeAxis4: "دارای ظرفیت شبکه‌سازی و نقش‌آفرینی منطقه‌ای",

          // محور ۵: تعهد و همکاری (سقف ۷۵ - نمره: ۶۸)
          scoreAxis5_1: 28,
          scoreAxis5_2: 18,
          scoreAxis5_3: 22,
          rawAxis5: 68,
          qualitativeAxis5: "آماده پذیرش نقش فعال و مستمر",

          // نمره کل موزون: (46/50)*15 + (74/80)*25 + (95/100)*15 + (92/100)*25 + (68/75)*20 = 13.8 + 23.125 + 14.25 + 23 + 18.13 = 92.31
          totalWeightedScore: 92.31,
          finalRecommendation: "KEY_AXIS",
          finalNotes: "معلم در بالاترین سطح شایستگی شبکه‌ای قرار دارد و می‌تواند به عنوان لیدر منطقه‌ای انتخاب شود.",
        },
      },
    },
  });

  // معلم ۲: سطح «مستعد ارتباط رشدی» (DEVELOPMENTAL_RELATION - ۵۰ تا ۸۰٪)
  const teacher2 = await prisma.teacher.create({
    data: {
      firstName: "زهرا",
      lastName: "صادقی",
      phone: "09122223344",
      nationalCode: "0022222222",
      teachingYears: 8,
      roleTitle: "مشاور",
      subject: "روانشناسی و هدایت تحصیلی",
      grade: "متوسطه اول و دوم",
      schoolId: school2.id,
      collaborationStatus: "DEVELOPMENTAL_RELATION",
      bio: "مشاور تحصیلی و تربیتی پویا با روابط صمیمانه و انگیزه بالا در زمینه تاریخ شفاهی و کشف استعداد دانش‌آموزان.",
      evaluations: {
        create: {
          evaluatorId: evaluator1.id,
          dialogueDurationMin: 45,
          familiarityLevel: "MEDIUM",

          // محور ۱: ۳۸ از ۵۰
          scoreAxis1_1: 22,
          scoreAxis1_2: 16,
          rawAxis1: 38,
          qualitativeAxis1: "ارتباط مناسب اما محدود",
          notesAxis1: "ارتباط کلاسی بسیار صمیمی است اما شواهد مراجعات عمیق خارج کلاسی نیازمند تقویت است.",

          // محور ۲: ۵۸ از ۸۰
          scoreAxis2_1: 22,
          scoreAxis2_2: 20,
          scoreAxis2_3: 16,
          rawAxis2: 58,
          qualitativeAxis2: "توان مناسب و قابل اتکا در شناسایی استعداد",

          // محور ۳: ۷۲ از ۱۰۰
          scoreAxis3_1: 28,
          scoreAxis3_2: 24,
          scoreAxis3_3: 20,
          rawAxis3: 72,
          qualitativeAxis3: "نگرش مثبت و ظرفیت قابل رشد",

          // محور ۴: ۶۸ از ۱۰۰
          scoreAxis4_1: 25,
          scoreAxis4_2: 25,
          scoreAxis4_3: 18,
          rawAxis4: 68,
          qualitativeAxis4: "دارای ارتباطات مناسب اما نیازمند تقویت",

          // محور ۵: ۵۰ از ۷۵
          scoreAxis5_1: 20,
          scoreAxis5_2: 14,
          scoreAxis5_3: 16,
          rawAxis5: 50,
          qualitativeAxis5: "قابل همکاری با حمایت و پیگیری",

          // نمره موزون: (38/50)*15 + (58/80)*25 + (72/100)*15 + (68/100)*25 + (50/75)*20 = 11.4 + 18.125 + 10.8 + 17 + 13.33 = 70.66
          totalWeightedScore: 70.66,
          finalRecommendation: "DEVELOPMENTAL_RELATION",
          finalNotes: "گزینه بسیار مناسب برای عضویت در کارگروه‌های تخصصی معلمان همراه با منتورینگ.",
        },
      },
    },
  });

  // معلم ۳: سطح «ارتباط موردی» (OCCASIONAL_RELATION - ۳۰ تا ۵۰٪)
  const teacher3 = await prisma.teacher.create({
    data: {
      firstName: "امیر",
      lastName: "مرادی",
      phone: "09123334455",
      nationalCode: "0033333333",
      teachingYears: 5,
      roleTitle: "معاون آموزشی",
      subject: "جامعه‌شناسی و برنامه‌ریزی",
      grade: "متوسطه دوم",
      schoolNameManual: "دبیرستان نمونه شهدای هسته‌ای",
      collaborationStatus: "OCCASIONAL_RELATION",
      bio: "معاون آموزشی با تخصص خوب در دروس جامعه‌شناسی ولی زمان اجرایی محدود.",
      evaluations: {
        create: {
          evaluatorId: evaluator2.id,
          dialogueDurationMin: 30,
          familiarityLevel: "LOW",

          // محور ۱: ۲۰ از ۵۰
          scoreAxis1_1: 12,
          scoreAxis1_2: 8,
          rawAxis1: 20,
          qualitativeAxis1: "ارتباط عمدتاً رسمی و آموزشی",

          // محور ۲: ۳۰ از ۸۰
          scoreAxis2_1: 12,
          scoreAxis2_2: 10,
          scoreAxis2_3: 8,
          rawAxis2: 30,
          qualitativeAxis2: "شناسایی محدود و نیازمند شواهد تکمیلی",

          // محور ۳: ۴۵ از ۱۰۰
          scoreAxis3_1: 16,
          scoreAxis3_2: 15,
          scoreAxis3_3: 14,
          rawAxis3: 45,
          qualitativeAxis3: "شناخت محدود؛ مناسب همکاری موردی",

          // محور ۴: ۳۸ از ۱۰۰
          scoreAxis4_1: 14,
          scoreAxis4_2: 14,
          scoreAxis4_3: 10,
          rawAxis4: 38,
          qualitativeAxis4: "دارای ارتباطات محدود؛ مناسب ارتباط موردی",

          // محور ۵: ۲۸ از ۷۵
          scoreAxis5_1: 12,
          scoreAxis5_2: 6,
          scoreAxis5_3: 10,
          rawAxis5: 28,
          qualitativeAxis5: "مناسب فعالیت محدود یا موردی",

          // نمره موزون: (20/50)*15 + (30/80)*25 + (45/100)*15 + (38/100)*25 + (28/75)*20 = 6 + 9.375 + 6.75 + 9.5 + 7.47 = 39.1
          totalWeightedScore: 39.1,
          finalRecommendation: "OCCASIONAL_RELATION",
          finalNotes: "صرفاً برای رویدادهای مقطعی یا داوری مسابقات ادبی و اجتماعی مناسب است.",
        },
      },
    },
  });

  // معلم ۴: سطح «نامناسب همکاری» (UNSUITABLE - زیر ۳۰٪)
  const teacher4 = await prisma.teacher.create({
    data: {
      firstName: "بهروز",
      lastName: "کاظمی",
      phone: "09124445566",
      nationalCode: "0044444444",
      teachingYears: 2,
      roleTitle: "معلم",
      subject: "فلسفه و منطق",
      grade: "متوسطه دوم",
      schoolNameManual: "دبیرستان غیردولتی دانش",
      collaborationStatus: "UNSUITABLE",
      bio: "صرفاً تدریس کنکوری نمره‌محور بدون دغدغه تربیتی یا شبکه‌ای.",
      evaluations: {
        create: {
          evaluatorId: evaluator2.id,
          dialogueDurationMin: 25,
          familiarityLevel: "LOW",

          // محور ۱: ۱۰ از ۵۰
          scoreAxis1_1: 6,
          scoreAxis1_2: 4,
          rawAxis1: 10,
          qualitativeAxis1: "ارتباط کم‌اثر یا نامتناسب",

          // محور ۲: ۱۵ از ۸۰
          scoreAxis2_1: 6,
          scoreAxis2_2: 5,
          scoreAxis2_3: 4,
          rawAxis2: 15,
          qualitativeAxis2: "فاقد توان تشخیص و شواهد عینی استعداد",

          // محور ۳: ۲۲ از ۱۰۰
          scoreAxis3_1: 8,
          scoreAxis3_2: 8,
          scoreAxis3_3: 6,
          rawAxis3: 22,
          qualitativeAxis3: "نگاه سطحی، منفی یا نامتناسب",

          // محور ۴: ۲۰ از ۱۰۰
          scoreAxis4_1: 8,
          scoreAxis4_2: 7,
          scoreAxis4_3: 5,
          rawAxis4: 20,
          qualitativeAxis4: "فاقد ظرفیت شبکه‌ای قابل اتکا",

          // محور ۵: ۱۵ از ۷۵
          scoreAxis5_1: 6,
          scoreAxis5_2: 4,
          scoreAxis5_3: 5,
          rawAxis5: 15,
          qualitativeAxis5: "فاقد امکان استمرار یا توان اجرایی کافی",

          // نمره موزون: (10/50)*15 + (15/80)*25 + (22/100)*15 + (20/100)*25 + (15/75)*20 = 3 + 4.69 + 3.3 + 5 + 4 = 19.99
          totalWeightedScore: 19.99,
          finalRecommendation: "UNSUITABLE",
          finalNotes: "دیدگاه کاملاً تجاری به آموزش دارد و فاقد تمایل به همکاری شبکه‌ای است.",
        },
      },
    },
  });

  // ۶. ایجاد لاگ‌های ساعت کاری نمونه برای ارزیاب‌ها و کمک‌ارزیاب‌ها
  // ساعت کاری خود ارزیاب ۱
  await prisma.timesheetLog.create({
    data: {
      evaluatorId: evaluator1.id,
      workerType: "EVALUATOR",
      durationMinutes: 180, // ۳ ساعت
      description: "جلسه مصاحبه و تکمیل فرم ارزیابی تفصیلی معلمان علامه حلی",
      schoolId: school1.id,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // ۲ روز پیش
    },
  });

  // ساعت کاری کمک‌ارزیاب ۱ (ثبت شده توسط ارزیاب ۱)
  await prisma.timesheetLog.create({
    data: {
      evaluatorId: evaluator1.id,
      workerType: "ASSISTANT_EVALUATOR",
      assistantEvaluatorId: assistant1.id,
      durationMinutes: 240, // ۴ ساعت
      description: "بررسی میدانی فعالیت‌های دانش‌آموزی و هماهنگی گفت‌وگو با معلمان دبیرستان احسان",
      schoolId: school2.id,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
  });

  // ساعت کاری کمک‌ارزیاب ۲ (ثبت شده توسط ارزیاب ۱)
  await prisma.timesheetLog.create({
    data: {
      evaluatorId: evaluator1.id,
      workerType: "ASSISTANT_EVALUATOR",
      assistantEvaluatorId: assistant2.id,
      durationMinutes: 120, // ۲ ساعت
      description: "استخراج سوابق آموزشی و پرورشی دبیران متقاضی ارزیابی",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    },
  });

  // ساعت کاری ارزیاب ۲
  await prisma.timesheetLog.create({
    data: {
      evaluatorId: evaluator2.id,
      workerType: "EVALUATOR",
      durationMinutes: 150, // ۲.۵ ساعت
      description: "ارزیابی حضوری دبیران جامعه‌شناسی و منطق در منطقه ۱",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    },
  });

  // ساعت کاری کمک‌ارزیاب ۳ (ثبت شده توسط ارزیاب ۲)
  await prisma.timesheetLog.create({
    data: {
      evaluatorId: evaluator2.id,
      workerType: "ASSISTANT_EVALUATOR",
      assistantEvaluatorId: assistant3.id,
      durationMinutes: 180, // ۳ ساعت
      description: "تنظیم پرسشنامه‌های اولیه و مستندسازی مدارک تدریس",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
