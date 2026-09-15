import { CollaborationStatus } from "@/generated/prisma/client";

// محاسبه توصیف‌های کیفی ۴‌گانه بر اساس نمرات خام سند
export function calculateAxisQualitative(axis: 1 | 2 | 3 | 4 | 5, rawScore: number): string {
  switch (axis) {
    case 1: // سقف ۵۰ نمره
      if (rawScore >= 40) return "ارتباط تربیتی عمیق و قابل اتکا";
      if (rawScore >= 25) return "ارتباط مناسب اما محدود";
      if (rawScore >= 15) return "ارتباط عمدتاً رسمی و آموزشی";
      return "ارتباط کم‌اثر یا نامتناسب";

    case 2: // سقف ۸۰ نمره
      if (rawScore >= 64) return "توانمند در شناسایی و هدایت استعداد";
      if (rawScore >= 40) return "دارای ظرفیت مناسب، نیازمند توانمندسازی بیشتر";
      if (rawScore >= 24) return "مناسب معرفی موردی دانش‌آموز";
      return "فاقد توان کافی برای هدایت استعداد";

    case 3: // سقف ۱۰۰ نمره
      if (rawScore >= 80) return "ظرفیت بالا برای نقش‌آفرینی در هدایت به علوم انسانی";
      if (rawScore >= 50) return "نگرش مثبت و ظرفیت قابل رشد";
      if (rawScore >= 30) return "شناخت محدود؛ مناسب همکاری موردی";
      return "نگاه سطحی، منفی یا نامتناسب";

    case 4: // سقف ۱۰۰ نمره
      if (rawScore >= 80) return "دارای ظرفیت شبکه‌سازی و نقش‌آفرینی منطقه‌ای";
      if (rawScore >= 50) return "دارای ارتباطات مناسب اما نیازمند تقویت";
      if (rawScore >= 30) return "دارای ارتباطات محدود؛ مناسب ارتباط موردی";
      return "فاقد ظرفیت شبکه‌ای قابل اتکا";

    case 5: // سقف ۷۵ نمره
      if (rawScore >= 60) return "آماده پذیرش نقش فعال و مستمر";
      if (rawScore >= 37.5) return "قابل همکاری با حمایت و پیگیری";
      if (rawScore >= 22.5) return "مناسب فعالیت محدود یا موردی";
      return "فاقد امکان استمرار یا توان اجرایی کافی";
  }
}

// گزینه‌های توصیف کیفی هر یک از محورهای ۵‌گانه جهت فیلترگذاری و نمایش در پنل مدیر
export const AXIS_QUALITATIVE_OPTIONS: Record<
  number,
  { id: number; title: string; shortTitle: string; options: string[] }
> = {
  1: {
    id: 1,
    title: "محور ۱: رابطه تربیتی و اثرگذاری بر دانش‌آموز",
    shortTitle: "محور ۱ (رابطه تربیتی)",
    options: [
      "ارتباط تربیتی عمیق و قابل اتکا",
      "ارتباط مناسب اما محدود",
      "ارتباط عمدتاً رسمی و آموزشی",
      "ارتباط کم‌اثر یا نامتناسب",
    ],
  },
  2: {
    id: 2,
    title: "محور ۲: توان شناسایی استعداد",
    shortTitle: "محور ۲ (شناسایی استعداد)",
    options: [
      "توانمند در شناسایی و هدایت استعداد",
      "دارای ظرفیت مناسب، نیازمند توانمندسازی بیشتر",
      "مناسب معرفی موردی دانش‌آموز",
      "فاقد توان کافی برای هدایت استعداد",
    ],
  },
  3: {
    id: 3,
    title: "محور ۳: نگرش و ظرفیت علوم انسانی",
    shortTitle: "محور ۳ (نگرش علوم انسانی)",
    options: [
      "ظرفیت بالا برای نقش‌آفرینی در هدایت به علوم انسانی",
      "نگرش مثبت و ظرفیت قابل رشد",
      "شناخت محدود؛ مناسب همکاری موردی",
      "نگاه سطحی، منفی یا نامتناسب",
    ],
  },
  4: {
    id: 4,
    title: "محور ۴: سرمایه ارتباطی و ظرفیت شبکه‌سازی",
    shortTitle: "محور ۴ (سرمایه ارتباطی)",
    options: [
      "دارای ظرفیت شبکه‌سازی و نقش‌آفرینی منطقه‌ای",
      "دارای ارتباطات مناسب اما نیازمند تقویت",
      "دارای ارتباطات محدود؛ مناسب ارتباط موردی",
      "فاقد ظرفیت شبکه‌ای قابل اتکا",
    ],
  },
  5: {
    id: 5,
    title: "محور ۵: تعهد و قابلیت همکاری اجرایی",
    shortTitle: "محور ۵ (تعهد و همکاری)",
    options: [
      "آماده پذیرش نقش فعال و مستمر",
      "قابل همکاری با حمایت و پیگیری",
      "مناسب فعالیت محدود یا موردی",
      "فاقد امکان استمرار یا توان اجرایی کافی",
    ],
  },
};

// محاسبه وضعیت نهایی از روی نمره موزون کل (از ۱۰۰)
export function calculateFinalCollaborationStatus(totalWeightedScore: number): CollaborationStatus {
  if (totalWeightedScore >= 80) return "KEY_AXIS";
  if (totalWeightedScore >= 50) return "DEVELOPMENTAL_RELATION";
  if (totalWeightedScore >= 30) return "OCCASIONAL_RELATION";
  return "UNSUITABLE";
}
