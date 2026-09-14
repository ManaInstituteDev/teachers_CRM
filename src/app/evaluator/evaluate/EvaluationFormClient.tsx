"use client";

import { useActionState, useState, useMemo } from "react";
import { submitEvaluationAction } from "@/app/actions/evaluation";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardPenLine,
  User,
  School,
  Clock,
  Award,
  Sparkles,
  CheckCircle2,
  FileText,
  HelpCircle,
} from "lucide-react";

interface SchoolOption {
  id: string;
  name: string;
  district: string;
}

export default function EvaluationFormClient({
  schools,
}: {
  schools: SchoolOption[];
}) {
  const [state, formAction, isPending] = useActionState(submitEvaluationAction, null);

  // نمرات محور ۱
  const [a1_1, setA1_1] = useState(25);
  const [a1_2, setA1_2] = useState(15);
  const [a1_3, setA1_3] = useState(15);
  const [a1_4, setA1_4] = useState(25);

  // نمرات محور ۲
  const [a2_1, setA2_1] = useState(25);
  const [a2_2, setA2_2] = useState(25);
  const [a2_3, setA2_3] = useState(15);
  const [a2_4, setA2_4] = useState(15);

  // نمرات محور ۳
  const [a3_1, setA3_1] = useState(30);
  const [a3_2, setA3_2] = useState(30);
  const [a3_3, setA3_3] = useState(25);

  // نمرات محور ۴
  const [a4_1, setA4_1] = useState(30);
  const [a4_2, setA4_2] = useState(30);
  const [a4_3, setA4_3] = useState(25);

  // نمرات محور ۵
  const [a5_1, setA5_1] = useState(25);
  const [a5_2, setA5_2] = useState(15);
  const [a5_3, setA5_3] = useState(20);
  const [a5_4, setA5_4] = useState(20);

  // محاسبات آنلاین نمرات خام و نمره موزون
  const raw1 = a1_1 + a1_2 + a1_3 + a1_4;
  const raw2 = a2_1 + a2_2 + a2_3 + a2_4;
  const raw3 = a3_1 + a3_2 + a3_3;
  const raw4 = a4_1 + a4_2 + a4_3;
  const raw5 = a5_1 + a5_2 + a5_3 + a5_4;

  const totalWeighted = useMemo(() => {
    const sum =
      raw1 * 0.15 +
      raw2 * 0.25 +
      raw3 * 0.15 +
      raw4 * 0.25 +
      raw5 * 0.2;
    return Number(sum.toFixed(1));
  }, [raw1, raw2, raw3, raw4, raw5]);

  // پیشنهاد وضعیت همکاری بر اساس نمره
  const suggestedStatus = useMemo(() => {
    if (totalWeighted >= 80) return "DEVELOPMENTAL_RELATION";
    if (totalWeighted >= 60) return "OCCASIONAL_RELATION";
    return "UNSUITABLE";
  }, [totalWeighted]);

  const [finalStatus, setFinalStatus] = useState<string>(suggestedStatus);

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      {/* بازگشت */}
      <Link
        href="/evaluator"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowRight className="w-4 h-4" />
        <span>بازگشت به داشبورد</span>
      </Link>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* فرم اصلی ارزیابی */}
        <div className="flex-1 w-full space-y-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <ClipboardPenLine className="w-6 h-6" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              فرم ارزیابی ظرفیت شبکه‌ای معلم
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              ثبت اطلاعات اولیه مصاحبه، شاخص‌های ۵ محوره شایستگی و محاسبه خودکار نمره نهایی
            </p>
          </div>

          {state?.error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-8">
            {/* بخش ۱: اطلاعات اولیه و مصاحبه */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                  •
                </span>
                <span>اطلاعات اولیه معلم و مصاحبه</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    نام معلم <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    placeholder="نام"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    نام خانوادگی معلم <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    placeholder="نام خانوادگی"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    شماره تلفن همراه
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="0912..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm transition outline-none font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    سابقه تدریس (سال)
                  </label>
                  <input
                    type="number"
                    name="teachingYears"
                    defaultValue={5}
                    min={0}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    رشته تدریس <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="مثال: ادبیات، تاریخ، جامعه‌شناسی، معارف و..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    مقطع تدریس <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="grade"
                    required
                    placeholder="مثال: متوسطه اول یا متوسطه دوم"
                    defaultValue="متوسطه دوم"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    مدرسه محل تدریس
                  </label>
                  <select
                    name="schoolId"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
                  >
                    <option value="">-- انتخاب از مدارس ثبت‌شده --</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    یا نام مدرسه به صورت دستی
                  </label>
                  <input
                    type="text"
                    name="schoolNameManual"
                    placeholder="در صورت نبودن در لیست بالا"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
                  />
                </div>
              </div>

              {/* مشخصات گفت‌وگو و ارزیاب */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    مدت گفت‌وگو (دقیقه)
                  </label>
                  <input
                    type="number"
                    name="dialogueDurationMin"
                    defaultValue={30}
                    min={5}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    سطح آشنایی ارزیاب با معلم
                  </label>
                  <select
                    name="familiarityLevel"
                    defaultValue="MEDIUM"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
                  >
                    <option value="LOW">کم</option>
                    <option value="MEDIUM">متوسط</option>
                    <option value="HIGH">زیاد</option>
                  </select>
                </div>
              </div>
            </div>

            {/* محور ۱: رابطه تربیتی و اثرگذاری بر دانش‌آموز (وزن ۱۵٪) */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      ۱
                    </span>
                    <span>رابطه تربیتی و اثرگذاری بر دانش‌آموز (وزن در نهایی: ۱۵٪)</span>
                  </h2>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl">
                  جمع خام: {raw1} از ۱۰۰
                </span>
              </div>

              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-slate-700 flex-1">
                    شناخت دانش‌آموزان فراتر از نمره و عملکرد درسی؛ توان توصیف دقیق ویژگی‌های فردی آنان (۰ تا ۳۰)
                  </label>
                  <input
                    type="number"
                    name="scoreAxis1_1"
                    min={0}
                    max={30}
                    value={a1_1}
                    onChange={(e) => setA1_1(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center text-sm font-bold"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-slate-700 flex-1">
                    وجود رابطه اعتمادآمیز؛ مراجعه یا رجوع واقعی دانش‌آموزان برای مشورت و گفت‌وگو (۰ تا ۲۰)
                  </label>
                  <input
                    type="number"
                    name="scoreAxis1_2"
                    min={0}
                    max={20}
                    value={a1_2}
                    onChange={(e) => setA1_2(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center text-sm font-bold"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-slate-700 flex-1">
                    احترام به تفاوت‌های فردی و پرهیز از تحقیر، برچسب‌زنی و مقایسه مخرب (۰ تا ۲۰)
                  </label>
                  <input
                    type="number"
                    name="scoreAxis1_3"
                    min={0}
                    max={20}
                    value={a1_3}
                    onChange={(e) => setA1_3(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center text-sm font-bold"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-slate-700 flex-1">
                    توان اثرگذاری و ایجاد انگیزه بدون تحمیل نظر یا وابسته کردن دانش‌آموز (۰ تا ۳۰)
                  </label>
                  <input
                    type="number"
                    name="scoreAxis1_4"
                    min={0}
                    max={30}
                    value={a1_4}
                    onChange={(e) => setA1_4(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    نظر کیفی ارزیاب در محور ۱:
                  </label>
                  <select
                    name="qualitativeAxis1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="ارتباط تربیتی عمیق و قابل اتکا">ارتباط تربیتی عمیق و قابل اتکا</option>
                    <option value="ارتباط مناسب اما محدود">ارتباط مناسب اما محدود</option>
                    <option value="ارتباط عمدتاً رسمی و آموزشی">ارتباط عمدتاً رسمی و آموزشی</option>
                    <option value="ارتباط کم‌اثر یا نامتناسب">ارتباط کم‌اثر یا نامتناسب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    توضیحات و مصادیق ارزیاب:
                  </label>
                  <input
                    type="text"
                    name="notesAxis1"
                    placeholder="شواهد عینی از رابطه با دانش‌آموزان..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* محور ۲: توان شناسایی استعداد (وزن ۲۵٪) */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      ۲
                    </span>
                    <span>توان شناسایی استعداد (وزن در نهایی: ۲۵٪)</span>
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">در این محور مؤلفه پیگیری و ارجاع به متخصص حذف شده است.</p>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl">
                  جمع خام: {raw2} از ۱۰۰
                </span>
              </div>

              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-slate-700 flex-1">
                    تشخیص ظرفیت دانش‌آموز فراتر از معدل، رتبه و عملکرد ظاهری (۰ تا ۳۰)
                  </label>
                  <input
                    type="number"
                    name="scoreAxis2_1"
                    min={0}
                    max={30}
                    value={a2_1}
                    onChange={(e) => setA2_1(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center text-sm font-bold"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-slate-700 flex-1">
                    ارائه شواهد عینی از رفتار، تولید، پرسش، تحلیل یا عملکرد متفاوت دانش‌آموز (۰ تا ۳۰)
                  </label>
                  <input
                    type="number"
                    name="scoreAxis2_2"
                    min={0}
                    max={30}
                    value={a2_2}
                    onChange={(e) => setA2_2(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center text-sm font-bold"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-slate-700 flex-1">
                    توان تفکیک میان علاقه، استعداد، پشتکار و موفقیت فعلی (۰ تا ۲۰)
                  </label>
                  <input
                    type="number"
                    name="scoreAxis2_3"
                    min={0}
                    max={20}
                    value={a2_3}
                    onChange={(e) => setA2_3(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center text-sm font-bold"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-slate-700 flex-1">
                    توان تشخیص ظرفیت‌های مرتبط با علوم انسانی (تحلیل، استدلال، فهم اجتماعی، روایتگری، مسئله‌شناسی) (۰ تا ۲۰)
                  </label>
                  <input
                    type="number"
                    name="scoreAxis2_4"
                    min={0}
                    max={20}
                    value={a2_4}
                    onChange={(e) => setA2_4(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center text-sm font-bold"
                  />
                </div>
              </div>
            </div>

            {/* محور ۳: نگرش و ظرفیت علوم انسانی (وزن ۱۵٪) */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      ۳
                    </span>
                    <span>نگرش و ظرفیت علوم انسانی (وزن در نهایی: ۱۵٪)</span>
                  </h2>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl">
                  جمع خام: {raw3} از ۱۰۰
                </span>
              </div>

              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-slate-700 flex-1">
                    باور به اهمیت علوم انسانی و پرهیز از نگاه درجه‌دو یا کلیشه‌ای به آن (۰ تا ۳۵)
                  </label>
                  <input
                    type="number"
                    name="scoreAxis3_1"
                    min={0}
                    max={35}
                    value={a3_1}
                    onChange={(e) => setA3_1(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center text-sm font-bold"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-slate-700 flex-1">
                    شناخت اولیه و واقع‌بینانه از حوزه‌های اصلی علوم انسانی و تفاوت آنها (۰ تا ۳۵)
                  </label>
                  <input
                    type="number"
                    name="scoreAxis3_2"
                    min={0}
                    max={35}
                    value={a3_2}
                    onChange={(e) => setA3_2(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center text-sm font-bold"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-slate-700 flex-1">
                    توان پیوندزدن علوم انسانی با مسائل واقعی جامعه و ظرفیت‌های دانش‌آموزان (۰ تا ۳۰)
                  </label>
                  <input
                    type="number"
                    name="scoreAxis3_3"
                    min={0}
                    max={30}
                    value={a3_3}
                    onChange={(e) => setA3_3(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  سطح کیفی ارزیاب در محور ۳:
                </label>
                <select
                  name="qualitativeAxis3"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                >
                  <option value="ظرفیت بالا برای نقش‌آفرینی در هدایت به علوم انسانی">ظرفیت بالا برای نقش‌آفرینی در هدایت به علوم انسانی</option>
                  <option value="نگرش مثبت و ظرفیت قابل رشد">نگرش مثبت و ظرفیت قابل رشد</option>
                  <option value="شناخت محدود؛ مناسب همکاری موردی">شناخت محدود؛ مناسب همکاری موردی</option>
                  <option value="نگاه سطحی، منفی یا نامتناسب">نگاه سطحی، منفی یا نامتناسب</option>
                </select>
              </div>
            </div>

            {/* محور ۴: سرمایه ارتباطی و ظرفیت شبکه‌سازی (وزن ۲۵٪) */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      ۴
                    </span>
                    <span>سرمایه ارتباطی و ظرفیت شبکه‌سازی (وزن در نهایی: ۲۵٪)</span>
                  </h2>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl">
                  جمع خام: {raw4} از ۱۰۰
                </span>
              </div>

              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-slate-700 flex-1">
                    دسترسی مؤثر به دانش‌آموزان و مدارس، به‌ویژه دانش‌آموزان مستعد (۰ تا ۳۵)
                  </label>
                  <input
                    type="number"
                    name="scoreAxis4_1"
                    min={0}
                    max={35}
                    value={a4_1}
                    onChange={(e) => setA4_1(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center text-sm font-bold"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-slate-700 flex-1">
                    ارتباط حرفه‌ای و قابل اتکا با معلمان، مدیران، مشاوران یا فعالان تربیتی (۰ تا ۳۵)
                  </label>
                  <input
                    type="number"
                    name="scoreAxis4_2"
                    min={0}
                    max={35}
                    value={a4_2}
                    onChange={(e) => setA4_2(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center text-sm font-bold"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-slate-700 flex-1">
                    توان معرفی و همراه کردن افراد مناسب با یک برنامه مشترک (۰ تا ۳۰)
                  </label>
                  <input
                    type="number"
                    name="scoreAxis4_3"
                    min={0}
                    max={30}
                    value={a4_3}
                    onChange={(e) => setA4_3(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  سطح کیفی ارزیاب در محور ۴:
                </label>
                <select
                  name="qualitativeAxis4"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                >
                  <option value="دارای ظرفیت شبکه‌سازی و نقش‌آفرینی منطقه‌ای">دارای ظرفیت شبکه‌سازی و نقش‌آفرینی منطقه‌ای</option>
                  <option value="دارای ارتباطات مناسب اما نیازمند تقویت">دارای ارتباطات مناسب اما نیازمند تقویت</option>
                  <option value="دارای ارتباطات محدود؛ مناسب ارتباط موردی">دارای ارتباطات محدود؛ مناسب ارتباط موردی</option>
                  <option value="فاقد ظرفیت شبکه‌ای قابل اتکا">فاقد ظرفیت شبکه‌ای قابل اتکا</option>
                </select>
              </div>
            </div>

            {/* محور ۵: تعهد و قابلیت همکاری اجرایی (وزن ۲۰٪) */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      ۵
                    </span>
                    <span>تعهد و قابلیت همکاری اجرایی (وزن در نهایی: ۲۰٪)</span>
                  </h2>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl">
                  جمع خام: {raw5} از ۱۰۰
                </span>
              </div>

              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-slate-700 flex-1">
                    سابقه اجرای یک فعالیت تربیتی، آموزشی یا اجتماعی از آغاز تا پایان (۰ تا ۳۰)
                  </label>
                  <input
                    type="number"
                    name="scoreAxis5_1"
                    min={0}
                    max={30}
                    value={a5_1}
                    onChange={(e) => setA5_1(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center text-sm font-bold"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-slate-700 flex-1">
                    داشتن زمان و امکان مشخص برای همکاری منظم (۰ تا ۲۰)
                  </label>
                  <input
                    type="number"
                    name="scoreAxis5_2"
                    min={0}
                    max={20}
                    value={a5_2}
                    onChange={(e) => setA5_2(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center text-sm font-bold"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-slate-700 flex-1">
                    سابقه پیگیری، پاسخگویی و به‌انجام‌رساندن تعهدات (۰ تا ۲۵)
                  </label>
                  <input
                    type="number"
                    name="scoreAxis5_3"
                    min={0}
                    max={25}
                    value={a5_3}
                    onChange={(e) => setA5_3(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center text-sm font-bold"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs text-slate-700 flex-1">
                    توان همکاری تیمی و پذیرش چارچوب، تقسیم کار و بازخورد (۰ تا ۲۵)
                  </label>
                  <input
                    type="number"
                    name="scoreAxis5_4"
                    min={0}
                    max={25}
                    value={a5_4}
                    onChange={(e) => setA5_4(Number(e.target.value))}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  سطح کیفی ارزیاب در محور ۵:
                </label>
                <select
                  name="qualitativeAxis5"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                >
                  <option value="آماده پذیرش نقش فعال و مستمر">آماده پذیرش نقش فعال و مستمر</option>
                  <option value="قابل همکاری با حمایت و پیگیری">قابل همکاری با حمایت و پیگیری</option>
                  <option value="مناسب فعالیت محدود یا موردی">مناسب فعالیت محدود یا موردی</option>
                  <option value="فاقد امکان استمرار یا توان اجرایی کافی">فاقد امکان استمرار یا توان اجرایی کافی</option>
                </select>
              </div>
            </div>

            {/* جمع‌بندی نهایی */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <span>جمع‌بندی نهایی و وضعیت همکاری</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  وضعیت نهایی همکاری با معلم:
                </label>
                <select
                  name="finalRecommendation"
                  value={finalStatus}
                  onChange={(e) => setFinalStatus(e.target.value)}
                  className="w-full bg-emerald-50/50 border border-emerald-300 text-emerald-900 font-bold rounded-xl px-3.5 py-2.5 text-sm"
                >
                  <option value="DEVELOPMENTAL_RELATION">مستعد ارتباط رشدی (نخبه)</option>
                  <option value="OCCASIONAL_RELATION">ارتباط موردی</option>
                  <option value="UNSUITABLE">نامناسب همکاری</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  نظر تحلیلی و جمع‌بندی نهایی ارزیاب:
                </label>
                <textarea
                  name="finalNotes"
                  rows={3}
                  placeholder="توضیحات تکمیلی پیرامون ظرفیت‌های اختصاصی، اولویت‌های ارتباطی و پیشنهاد برای گام‌های بعدی..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed"
                ></textarea>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                href="/evaluator"
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium transition"
              >
                انصراف
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition cursor-pointer"
              >
                {isPending ? "در حال ثبت ارزیابی..." : "ثبت قطعی فرم ارزیابی"}
              </button>
            </div>
          </form>
        </div>

        {/* سایدبار چسبان (Sticky) محاسبه آنلاین اوزان و نمره نهایی */}
        <div className="w-full lg:w-80 shrink-0 sticky top-6 space-y-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-5 border border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400">محاسبه آنلاین نمره کل</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>

            <div className="text-center py-2">
              <div className="text-4xl font-extrabold text-emerald-400 font-mono">
                {totalWeighted}
              </div>
              <div className="text-xs text-slate-400 mt-1">امتیاز کل موزون از ۱۰۰</div>
            </div>

            <div className="space-y-3 pt-2 text-xs border-t border-slate-800">
              <div className="flex justify-between items-center text-slate-300">
                <span>۱. رابطه تربیتی (۱۵٪):</span>
                <span className="font-mono text-emerald-400 font-bold">{raw1}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>۲. توان استعدادیابی (۲۵٪):</span>
                <span className="font-mono text-emerald-400 font-bold">{raw2}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>۳. علوم انسانی (۱۵٪):</span>
                <span className="font-mono text-emerald-400 font-bold">{raw3}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>۴. شبکه‌سازی (۲۵٪):</span>
                <span className="font-mono text-emerald-400 font-bold">{raw4}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>۵. توان اجرایی (۲۰٪):</span>
                <span className="font-mono text-emerald-400 font-bold">{raw5}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center space-y-1">
              <div className="text-[11px] text-slate-400">پیشنهاد خودکار سیستم:</div>
              <div className="text-xs font-bold text-amber-300">
                {suggestedStatus === "DEVELOPMENTAL_RELATION"
                  ? "مستعد ارتباط رشدی"
                  : suggestedStatus === "OCCASIONAL_RELATION"
                  ? "ارتباط موردی"
                  : "نامناسب همکاری"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
