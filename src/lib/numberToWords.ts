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

/**
 * فرمت‌بندی سه رقم سه رقم عدد
 */
export function formatToman(amount: number): string {
  if (isNaN(amount)) return "۰ تومان";
  return amount.toLocaleString("fa-IR") + " تومان";
}
