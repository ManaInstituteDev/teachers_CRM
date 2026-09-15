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
      if (rawScore >= 64) return "توان بسیار بالا در شناسایی استعداد فراتر از نمره";
      if (rawScore >= 40) return "توان مناسب و قابل اتکا در شناسایی استعداد";
      if (rawScore >= 24) return "شناسایی محدود و نیازمند شواهد تکمیلی";
      return "فاقد توان تشخیص و شواهد عینی استعداد";

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

// محاسبه وضعیت نهایی از روی نمره موزون کل (از ۱۰۰)
export function calculateFinalCollaborationStatus(totalWeightedScore: number): CollaborationStatus {
  if (totalWeightedScore >= 80) return "KEY_AXIS";
  if (totalWeightedScore >= 50) return "DEVELOPMENTAL_RELATION";
  if (totalWeightedScore >= 30) return "OCCASIONAL_RELATION";
  return "UNSUITABLE";
}
