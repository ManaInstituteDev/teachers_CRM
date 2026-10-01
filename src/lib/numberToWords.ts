/**
 * تبدیل ارقام فارسی و عربی به ارقام استاندارد انگلیسی
 */
export function toEnglishDigits(str: string): string {
  if (!str) return "";
  return str
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728))
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1584));
}

/**
 * استخراج ارقام تمیز از ورودی کاربر با حذف کاما، فاصله و حروف
 */
export function extractCleanNumber(input: string): string {
  if (!input) return "";
  return toEnglishDigits(input).replace(/[^\d]/g, "");
}

/**
 * فرمت‌بندی اعداد به خط زیبای فارسی با جداکننده سه رقمی
 */
export function formatNumberFa(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "۰";
  return amount.toLocaleString("fa-IR");
}

/**
 * فرمت‌بندی سه رقم سه رقم به همراه برچسب تومان
 */
export function formatToman(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "۰ تومان";
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

/**
 * تبدیل اعداد به حروف فارسی (برای مبالغ تومان و ریال)
 */
export function numberToPersianWords(num: number): string {
  if (isNaN(num) || num <= 0) return "";

  const ones = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
  const teens = [
    "ده",
    "یازده",
    "دوازده",
    "سیزده",
    "چهارده",
    "پانزده",
    "شانزده",
    "هفده",
    "هجده",
    "نوزده",
  ];
  const tens = [
    "",
    "",
    "بیست",
    "سی",
    "چهل",
    "پنجاه",
    "شصت",
    "هفتاد",
    "هشتاد",
    "نود",
  ];
  const hundreds = [
    "",
    "یکصد",
    "دویست",
    "سیصد",
    "چهارصد",
    "پانصد",
    "ششصد",
    "هفتصد",
    "هشتصد",
    "نهصد",
  ];
  const scales = ["", "هزار", "میلیون", "میلیارد", "تریلیون"];

  function convertThreeDigits(n: number): string {
    const parts: string[] = [];
    const h = Math.floor(n / 100);
    const remainder = n % 100;
    const t = Math.floor(remainder / 10);
    const o = remainder % 10;

    if (h > 0) parts.push(hundreds[h]);

    if (remainder >= 10 && remainder < 20) {
      parts.push(teens[remainder - 10]);
    } else {
      if (t > 0) parts.push(tens[t]);
      if (o > 0) parts.push(ones[o]);
    }

    return parts.join(" و ");
  }

  const chunks: string[] = [];
  let currentNum = Math.floor(num);
  let scaleIndex = 0;

  while (currentNum > 0) {
    const chunk = currentNum % 1000;
    if (chunk > 0) {
      const chunkText = convertThreeDigits(chunk);
      const scaleText = scales[scaleIndex];
      chunks.unshift(scaleText ? `${chunkText} ${scaleText}` : chunkText);
    }
    currentNum = Math.floor(currentNum / 1000);
    scaleIndex++;
  }

  return chunks.join(" و ") + " تومان";
}
