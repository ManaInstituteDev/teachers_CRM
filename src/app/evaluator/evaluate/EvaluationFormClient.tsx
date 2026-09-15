"use client";

import { useActionState, useState, useMemo } from "react";
import { submitEvaluationAction } from "@/app/actions/evaluation";
import { calculateAxisQualitative, calculateFinalCollaborationStatus } from "@/lib/scoring";
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
  TrendingUp,
  AlertCircle,
  Layers,
  HeartHandshake,
  Compass,
  BookOpen,
  Share2,
  Briefcase,
} from "lucide-react";

interface SchoolOption {
  id: string;
  name: string;
  district: string;
}

export default function EvaluationFormClient({
  schools,
  initialSchoolId,
}: {
  schools: SchoolOption[];
  initialSchoolId?: string;
}) {
  const [state, formAction, isPending] = useActionState(submitEvaluationAction, null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(initialSchoolId || "");
  const [selectedRole, setSelectedRole] = useState<string>("معلم");
  const currentSchool = schools.find((s) => s.id === selectedSchoolId);

  // نمرات محور ۱: رابطه تربیتی (سقف ۵۰ - وزن ۱۵٪)
  const [a1_1, setA1_1] = useState(24);
  const [a1_2, setA1_2] = useState(16);

  // نمرات محور ۲: شناسایی استعداد (سقف ۸۰ - وزن ۲۵٪)
  const [a2_1, setA2_1] = useState(24);
  const [a2_2, setA2_2] = useState(24);
  const [a2_3, setA2_3] = useState(16);

  // نمرات محور ۳: نگرش علوم انسانی (سقف ۱۰۰ - وزن ۱۵٪)
  const [a3_1, setA3_1] = useState(28);
  const [a3_2, setA3_2] = useState(28);
  const [a3_3, setA3_3] = useState(24);

  // نمرات محور ۴: سرمایه ارتباطی (سقف ۱۰۰ - وزن ۲۵٪)
  const [a4_1, setA4_1] = useState(28);
  const [a4_2, setA4_2] = useState(28);
  const [a4_3, setA4_3] = useState(24);

  // نمرات محور ۵: تعهد و همکاری اجرایی (سقف ۷۵ - وزن ۲۰٪)
  const [a5_1, setA5_1] = useState(24);
  const [a5_2, setA5_2] = useState(15);
  const [a5_3, setA5_3] = useState(20);

  // محاسبات برخط نمرات خام
  const raw1 = a1_1 + a1_2;
  const raw2 = a2_1 + a2_2 + a2_3;
  const raw3 = a3_1 + a3_2 + a3_3;
  const raw4 = a4_1 + a4_2 + a4_3;
  const raw5 = a5_1 + a5_2 + a5_3;

  // توصیف‌های کیفی بلادرنگ هر محور
  const desc1 = useMemo(() => calculateAxisQualitative(1, raw1), [raw1]);
  const desc2 = useMemo(() => calculateAxisQualitative(2, raw2), [raw2]);
  const desc3 = useMemo(() => calculateAxisQualitative(3, raw3), [raw3]);
  const desc4 = useMemo(() => calculateAxisQualitative(4, raw4), [raw4]);
  const desc5 = useMemo(() => calculateAxisQualitative(5, raw5), [raw5]);

  // محاسبه سهم هر محور در نمره کل موزون
  const weighted1 = useMemo(() => (raw1 / 50) * 15, [raw1]);
  const weighted2 = useMemo(() => (raw2 / 80) * 25, [raw2]);
  const weighted3 = useMemo(() => (raw3 / 100) * 15, [raw3]);
  const weighted4 = useMemo(() => (raw4 / 100) * 25, [raw4]);
  const weighted5 = useMemo(() => (raw5 / 75) * 20, [raw5]);

  // نمره کل موزون از ۱۰۰
  const totalWeighted = useMemo(() => {
    const sum = weighted1 + weighted2 + weighted3 + weighted4 + weighted5;
    return Number(sum.toFixed(2));
  }, [weighted1, weighted2, weighted3, weighted4, weighted5]);

  // وضعیت نهایی ۴‌گانه بر اساس نمره کل موزون
  const calculatedStatus = useMemo(() => {
    return calculateFinalCollaborationStatus(totalWeighted);
  }, [totalWeighted]);

  const [overrideStatus, setOverrideStatus] = useState<string | null>(null);
  const currentFinalStatus = overrideStatus || calculatedStatus;

  const getStatusBadgeInfo = (status: string) => {
    switch (status) {
      case "KEY_AXIS":
        return {
          title: "محور (نخبه و پیشرو)",
          desc: "بالای ۸۰ درصد نمره کل - شایستگی لیدری و مدیریت شبکه‌ای",
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          indicator: "bg-purple-600",
        };
      case "DEVELOPMENTAL_RELATION":
        return {
          title: "مستعد ارتباط رشدی",
          desc: "بین ۵۰ تا ۸۰ درصد نمره کل - مناسب عضویت در کارگروه‌های تخصصی با همراهی",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          indicator: "bg-emerald-600",
        };
      case "OCCASIONAL_RELATION":
        return {
          title: "ارتباط موردی",
          desc: "بین ۳۰ تا ۵۰ درصد نمره کل - مناسب همکاری‌های مقطعی، رویدادها یا کارگاه‌ها",
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          indicator: "bg-amber-600",
        };
      case "UNSUITABLE":
      default:
        return {
          title: "نامناسب همکاری",
          desc: "زیر ۳۰ درصد نمره کل - فاقد نگرش یا ظرفیت‌های پایه شبکه‌ای",
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          indicator: "bg-rose-600",
        };
    }
  };

  const statusInfo = getStatusBadgeInfo(currentFinalStatus);

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      {/* دکمه بازگشت */}
      <Link
        href="/evaluator"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowRight className="w-4 h-4" />
        <span>بازگشت به داشبورد ارزیاب</span>
      </Link>

      <form action={formAction}>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* بخش اصلی فرم */}
          <div className="flex-1 w-full space-y-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
            {/* سربرگ فرم */}
            <div className="border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ClipboardPenLine className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    فرم ارزیابی ظرفیت شبکه‌ای معلم
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    سنجش دقیق ۵ محوره منطبق بر الگوی استاندارد ارزیابی علوم انسانی و شبکه‌سازی
                  </p>
                </div>
              </div>

              {currentSchool && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-emerald-800 font-medium">مدرسه انتخابی جهت ثبت کادر:</div>
                      <div className="text-sm font-black text-emerald-950">
                        {currentSchool.name} ({currentSchool.district})
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/evaluator/schools"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 shadow-sm transition"
                  >
                    تغییر یا انتخاب مدرسه دیگر
                  </Link>
                </div>
              )}

              {state?.error && (
                <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{state.error}</span>
                </div>
              )}
            </div>

            {/* ۱. اطلاعات اولیه فرد و جلسه ارزیابی */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                <span>۱. اطلاعات پایه و شناسایی فرد (کادر مدرسه)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* انتخاب نقش فرد */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    نقش در مدرسه <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="roleTitle"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition font-semibold text-slate-800"
                  >
                    <option value="معلم">معلم / دبیر / آموزگار</option>
                    <option value="مشاور">مشاور مدرسه</option>
                    <option value="معاون آموزشی">معاون آموزشی</option>
                    <option value="معاون پرورشی">معاون پرورشی</option>
                    <option value="معاون اجرایی">معاون اجرایی</option>
                    <option value="مدیر مدرسه">مدیر مدرسه</option>
                    <option value="مربی تربیتی">مربی تربیتی / فرهنگی</option>
                    <option value="سایر">سایر نقش‌ها (تایپ دستی)</option>
                  </select>
                </div>

                {selectedRole === "سایر" ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      عنوان دقیق نقش <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="roleTitleCustom"
                      required
                      placeholder="مثال: مسئول کانون، مربی پژوهش..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                ) : (
                  <div></div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    نام معلم <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    placeholder="مثال: سید محمد"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
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
                    placeholder="مثال: حسینی"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    شماره همراه
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="۰۹۱۲۰۰۰۰۰۰۰"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    کد ملی
                  </label>
                  <input
                    type="text"
                    name="nationalCode"
                    placeholder="۰۰۱۲۳۴۵۶۷۸"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    رشته / درس تدریس <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="مثال: ادبیات، تاریخ، جامعه‌شناسی، فلسفه"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
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
                    placeholder="مثال: متوسطه اول / متوسطه دوم پایه دهم و یازدهم"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    سابقه تدریس (سال)
                  </label>
                  <input
                    type="number"
                    name="teachingYears"
                    defaultValue="5"
                    min="0"
                    max="50"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    مدرسه محل خدمت
                  </label>
                  <select
                    name="schoolId"
                    value={selectedSchoolId}
                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  >
                    <option value="">-- انتخاب از مدارس ثبت‌شده یا ورود دستی --</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    نام مدرسه و منطقه (در صورت عدم انتخاب از لیست فوق)
                  </label>
                  <input
                    type="text"
                    name="schoolNameManual"
                    placeholder="مثال: دبیرستان نمونه دولتی رشد - منطقه ۲"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    مدت گفت‌وگو (دقیقه)
                  </label>
                  <input
                    type="number"
                    name="dialogueDurationMin"
                    defaultValue="45"
                    min="5"
                    max="300"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    سطح آشنایی ارزیاب با معلم
                  </label>
                  <select
                    name="familiarityLevel"
                    defaultValue="MEDIUM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  >
                    <option value="LOW">کم</option>
                    <option value="MEDIUM">متوسط</option>
                    <option value="HIGH">زیاد</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* --- محور ۱ --- */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    ۱
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      رابطه تربیتی و اثرگذاری بر دانش‌آموز
                    </h3>
                    <span className="text-xs text-indigo-700 font-medium">
                      وزن در امتیاز نهایی: ۱۵٪ | سقف نمره خام: ۵۰
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">نمره خام:</span>
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-indigo-200 text-indigo-800 font-black text-sm">
                    {raw1} <span className="text-slate-400 text-xs font-normal">/ ۵۰</span>
                  </span>
                </div>
              </div>

              {/* نشانگر توصیف کیفی محور ۱ */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">توصیف کیفی محور ۱:</span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100/60 px-3 py-1 rounded-lg">
                  {desc1}
                </span>
              </div>

              <div className="space-y-4 pt-2">
                {/* شاخص ۱-۱ */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm font-medium">
                    <span className="text-slate-800 font-semibold">
                      شناخت دانش‌آموزان فراتر از نمره و عملکرد درسی؛ توان توصیف دقیق ویژگی‌های فردی آنان
                    </span>
                    <span className="font-bold text-indigo-600 shrink-0 mr-2">{a1_1} از ۳۰</span>
                  </div>
                  <input
                    type="range"
                    name="scoreAxis1_1"
                    min="0"
                    max="30"
                    value={a1_1}
                    onChange={(e) => setA1_1(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>۰ (فاقد شناخت)</span>
                    <span>۱۵ (شناخت نسبی)</span>
                    <span>۳۰ (شناخت عمیق و توصیف دقیق)</span>
                  </div>
                </div>

                {/* شاخص ۱-۲ */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm font-medium">
                    <span className="text-slate-800 font-semibold">
                      وجود رابطه اعتمادآمیز؛ مراجعه یا رجوع واقعی دانش‌آموزان برای مشورت و گفت‌وگو
                    </span>
                    <span className="font-bold text-indigo-600 shrink-0 mr-2">{a1_2} از ۲۰</span>
                  </div>
                  <input
                    type="range"
                    name="scoreAxis1_2"
                    min="0"
                    max="20"
                    value={a1_2}
                    onChange={(e) => setA1_2(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>۰ (رابطه صرفاً رسمی)</span>
                    <span>۱۰ (مراجعات موردی)</span>
                    <span>۲۰ (مراجعات پرتکرار و اعتماد کامل)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    نظر ارزیاب در خصوص محور ۱ (شواهد، مصادیق و توضیحات):
                  </label>
                  <textarea
                    name="notesAxis1"
                    rows={2}
                    placeholder="شواهد مراجعات، رابطه تربیتی و نحوه تعامل معلم با دانش‌آموزان..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:bg-white focus:border-indigo-500 outline-none transition"
                  ></textarea>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* --- محور ۲ --- */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                    ۲
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      توان شناسایی استعداد
                    </h3>
                    <span className="text-xs text-emerald-700 font-medium">
                      وزن در امتیاز نهایی: ۲۵٪ | سقف نمره خام: ۸۰
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">نمره خام:</span>
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-emerald-200 text-emerald-800 font-black text-sm">
                    {raw2} <span className="text-slate-400 text-xs font-normal">/ ۸۰</span>
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/50 text-[11px] text-emerald-800">
                💡 <strong>نکته مهم سند:</strong> در این محور فقط توان شناسایی سنجیده می‌شود؛ مؤلفه «همراهی، پیگیری و ارجاع به متخصص» حذف شده است.
              </div>

              {/* نشانگر توصیف کیفی محور ۲ */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">توصیف کیفی محور ۲:</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-lg">
                  {desc2}
                </span>
              </div>

              <div className="space-y-4 pt-2">
                {/* شاخص ۲-۱ */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm font-medium">
                    <span className="text-slate-800 font-semibold">
                      تشخیص ظرفیت دانش‌آموز فراتر از معدل، رتبه و عملکرد ظاهری
                    </span>
                    <span className="font-bold text-emerald-600 shrink-0 mr-2">{a2_1} از ۳۰</span>
                  </div>
                  <input
                    type="range"
                    name="scoreAxis2_1"
                    min="0"
                    max="30"
                    value={a2_1}
                    onChange={(e) => setA2_1(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>۰ (صرفاً متکی به کارنامه و نمره)</span>
                    <span>۱۵ (تشخیص نسبی علایق)</span>
                    <span>۳۰ (تشخیص دقیق ظرفیت‌های پنهان)</span>
                  </div>
                </div>

                {/* شاخص ۲-۲ */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm font-medium">
                    <span className="text-slate-800 font-semibold">
                      ارائه شواهد عینی از رفتار، تولید، پرسش، تحلیل یا عملکرد متفاوت دانش‌آموز
                    </span>
                    <span className="font-bold text-emerald-600 shrink-0 mr-2">{a2_2} از ۳۰</span>
                  </div>
                  <input
                    type="range"
                    name="scoreAxis2_2"
                    min="0"
                    max="30"
                    value={a2_2}
                    onChange={(e) => setA2_2(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>۰ (فاقد شاهد عینی)</span>
                    <span>۱۵ (شواهد کلی)</span>
                    <span>۳۰ (شواهد دقیق و مستند ملموس)</span>
                  </div>
                </div>

                {/* شاخص ۲-۳ */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm font-medium">
                    <span className="text-slate-800 font-semibold">
                      توان تشخیص ظرفیت‌های مرتبط با علوم انسانی (تحلیل، استدلال، فهم اجتماعی، ارتباط، روایت‌گری یا مسئله‌شناسی)
                    </span>
                    <span className="font-bold text-emerald-600 shrink-0 mr-2">{a2_3} از ۲۰</span>
                  </div>
                  <input
                    type="range"
                    name="scoreAxis2_3"
                    min="0"
                    max="20"
                    value={a2_3}
                    onChange={(e) => setA2_3(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>۰ (عدم تمایز شایستگی‌ها)</span>
                    <span>۱۰ (شناخت متوسط مؤلفه‌ها)</span>
                    <span>۲۰ (تشخیص تخصصی مؤلفه‌های علوم انسانی)</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* --- محور ۳ --- */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-amber-50/70 p-4 rounded-2xl border border-amber-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                    ۳
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      نگرش و ظرفیت علوم انسانی
                    </h3>
                    <span className="text-xs text-amber-700 font-medium">
                      وزن در امتیاز نهایی: ۱۵٪ | سقف نمره خام: ۱۰۰
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">نمره خام:</span>
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-amber-200 text-amber-800 font-black text-sm">
                    {raw3} <span className="text-slate-400 text-xs font-normal">/ ۱۰۰</span>
                  </span>
                </div>
              </div>

              {/* نشانگر توصیف کیفی محور ۳ */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">توصیف کیفی محور ۳:</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-100/60 px-3 py-1 rounded-lg">
                  {desc3}
                </span>
              </div>

              <div className="space-y-4 pt-2">
                {/* شاخص ۳-۱ */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm font-medium">
                    <span className="text-slate-800 font-semibold">
                      باور به اهمیت علوم انسانی و پرهیز از نگاه درجه‌دو یا کلیشه‌ای به آن
                    </span>
                    <span className="font-bold text-amber-600 shrink-0 mr-2">{a3_1} از ۳۵</span>
                  </div>
                  <input
                    type="range"
                    name="scoreAxis3_1"
                    min="0"
                    max="35"
                    value={a3_1}
                    onChange={(e) => setA3_1(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>۰ (نگاه درجه‌دو یا کلیشه‌ای)</span>
                    <span>۱۸ (باور اولیه و احترام)</span>
                    <span>۳۵ (باور عمیق و اصیل به تمدن‌سازی علوم انسانی)</span>
                  </div>
                </div>

                {/* شاخص ۳-۲ */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm font-medium">
                    <span className="text-slate-800 font-semibold">
                      شناخت اولیه و واقع‌بینانه از حوزه‌های اصلی علوم انسانی و تفاوت آنها
                    </span>
                    <span className="font-bold text-amber-600 shrink-0 mr-2">{a3_2} از ۳۵</span>
                  </div>
                  <input
                    type="range"
                    name="scoreAxis3_2"
                    min="0"
                    max="35"
                    value={a3_2}
                    onChange={(e) => setA3_2(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>۰ (کم‌اطلاع از رشته‌ها)</span>
                    <span>۱۸ (شناخت عمومی)</span>
                    <span>۳۵ (شناخت دقیق گرایش‌ها و ماهیت رشته‌ها)</span>
                  </div>
                </div>

                {/* شاخص ۳-۳ */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm font-medium">
                    <span className="text-slate-800 font-semibold">
                      توان پیوندزدن علوم انسانی با مسائل واقعی جامعه و ظرفیت‌های دانش‌آموزان
                    </span>
                    <span className="font-bold text-amber-600 shrink-0 mr-2">{a3_3} از ۳۰</span>
                  </div>
                  <input
                    type="range"
                    name="scoreAxis3_3"
                    min="0"
                    max="30"
                    value={a3_3}
                    onChange={(e) => setA3_3(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>۰ (صرفاً تئوریک و انتزاعی)</span>
                    <span>۱۵ (پیوند موردی با مسائل)</span>
                    <span>۳۰ (توان بالا در حل مسئله و انگیزش دانش‌آموزان)</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* --- محور ۴ --- */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-sky-50/70 p-4 rounded-2xl border border-sky-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
                    ۴
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      سرمایه ارتباطی و ظرفیت شبکه‌سازی
                    </h3>
                    <span className="text-xs text-sky-700 font-medium">
                      وزن در امتیاز نهایی: ۲۵٪ | سقف نمره خام: ۱۰۰
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">نمره خام:</span>
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-sky-200 text-sky-800 font-black text-sm">
                    {raw4} <span className="text-slate-400 text-xs font-normal">/ ۱۰۰</span>
                  </span>
                </div>
              </div>

              {/* نشانگر توصیف کیفی محور ۴ */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">توصیف کیفی محور ۴:</span>
                <span className="text-xs font-bold text-sky-700 bg-sky-100/60 px-3 py-1 rounded-lg">
                  {desc4}
                </span>
              </div>

              <div className="space-y-4 pt-2">
                {/* شاخص ۴-۱ */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm font-medium">
                    <span className="text-slate-800 font-semibold">
                      دسترسی مؤثر به دانش‌آموزان و مدارس، به‌ویژه دانش‌آموزان مستعد
                    </span>
                    <span className="font-bold text-sky-600 shrink-0 mr-2">{a4_1} از ۳۵</span>
                  </div>
                  <input
                    type="range"
                    name="scoreAxis4_1"
                    min="0"
                    max="35"
                    value={a4_1}
                    onChange={(e) => setA4_1(Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>۰ (دسترسی محدود)</span>
                    <span>۱۸ (دسترسی به یک مدرسه)</span>
                    <span>۳۵ (دسترسی گسترده به مدارس و مستعدین منطقه)</span>
                  </div>
                </div>

                {/* شاخص ۴-۲ */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm font-medium">
                    <span className="text-slate-800 font-semibold">
                      ارتباط حرفه‌ای و قابل اتکا با معلمان، مدیران، مشاوران یا فعالان تربیتی
                    </span>
                    <span className="font-bold text-sky-600 shrink-0 mr-2">{a4_2} از ۳۵</span>
                  </div>
                  <input
                    type="range"
                    name="scoreAxis4_2"
                    min="0"
                    max="35"
                    value={a4_2}
                    onChange={(e) => setA4_2(Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>۰ (انزوا یا روابط تنش‌آلود)</span>
                    <span>۱۸ (روابط کاری عادی)</span>
                    <span>۳۵ (مورد وثوق و دارای ارتباطات موثر گسترده)</span>
                  </div>
                </div>

                {/* شاخص ۴-۳ */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm font-medium">
                    <span className="text-slate-800 font-semibold">
                      توان معرفی و همراه‌کردن افراد مناسب با یک برنامه مشترک
                    </span>
                    <span className="font-bold text-sky-600 shrink-0 mr-2">{a4_3} از ۳۰</span>
                  </div>
                  <input
                    type="range"
                    name="scoreAxis4_3"
                    min="0"
                    max="30"
                    value={a4_3}
                    onChange={(e) => setA4_3(Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>۰ (فاقد اثرگذاری تیمی)</span>
                    <span>۱۵ (همراهی در حد معمول)</span>
                    <span>۳۰ (نفوذ کلام و توان جذب و شبکه‌سازی بالا)</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* --- محور ۵ --- */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-rose-50/70 p-4 rounded-2xl border border-rose-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm">
                    ۵
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      تعهد و قابلیت همکاری اجرایی
                    </h3>
                    <span className="text-xs text-rose-700 font-medium">
                      وزن در امتیاز نهایی: ۲۰٪ | سقف نمره خام: ۷۵
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">نمره خام:</span>
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-rose-200 text-rose-800 font-black text-sm">
                    {raw5} <span className="text-slate-400 text-xs font-normal">/ ۷۵</span>
                  </span>
                </div>
              </div>

              {/* نشانگر توصیف کیفی محور ۵ */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">توصیف کیفی محور ۵:</span>
                <span className="text-xs font-bold text-rose-700 bg-rose-100/60 px-3 py-1 rounded-lg">
                  {desc5}
                </span>
              </div>

              <div className="space-y-4 pt-2">
                {/* شاخص ۵-۱ */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm font-medium">
                    <span className="text-slate-800 font-semibold">
                      سابقه اجرای یک فعالیت تربیتی، آموزشی یا اجتماعی از آغاز تا پایان
                    </span>
                    <span className="font-bold text-rose-600 shrink-0 mr-2">{a5_1} از ۳۰</span>
                  </div>
                  <input
                    type="range"
                    name="scoreAxis5_1"
                    min="0"
                    max="30"
                    value={a5_1}
                    onChange={(e) => setA5_1(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>۰ (فاقد سابقه پروژه کامل)</span>
                    <span>۱۵ (انجام کارهای محدود)</span>
                    <span>۳۰ (سابقه پروژه‌های موفق از آغاز تا پایان)</span>
                  </div>
                </div>

                {/* شاخص ۵-۲ */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm font-medium">
                    <span className="text-slate-800 font-semibold">
                      داشتن زمان و امکان مشخص برای همکاری منظم
                    </span>
                    <span className="font-bold text-rose-600 shrink-0 mr-2">{a5_2} از ۲۰</span>
                  </div>
                  <input
                    type="range"
                    name="scoreAxis5_2"
                    min="0"
                    max="20"
                    value={a5_2}
                    onChange={(e) => setA5_2(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>۰ (بسیار پرمشغله و بدون وقت)</span>
                    <span>۱۰ (امکان همکاری منعطف)</span>
                    <span>۲۰ (تخصیص زمان مشخص و متعهدانه)</span>
                  </div>
                </div>

                {/* شاخص ۵-۳ */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm font-medium">
                    <span className="text-slate-800 font-semibold">
                      توان همکاری تیمی و پذیرش چارچوب، تقسیم کار و بازخورد
                    </span>
                    <span className="font-bold text-rose-600 shrink-0 mr-2">{a5_3} از ۲۵</span>
                  </div>
                  <input
                    type="range"
                    name="scoreAxis5_3"
                    min="0"
                    max="25"
                    value={a5_3}
                    onChange={(e) => setA5_3(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>۰ (تک‌رو یا مقاومت در برابر بازخورد)</span>
                    <span>۱۲ (همکاری متوسط)</span>
                    <span>۲۵ (پذیرش کامل چارچوب و کار تیمی منسجم)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* سایدبار ثابت محاسبات و ثبت نهایی */}
          <div className="w-full lg:w-96 space-y-6 shrink-0 lg:sticky lg:top-6">
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-6 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>محاسبه برخط امتیاز نهایی</span>
                </h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 font-semibold">
                  موزون از ۱۰۰
                </span>
              </div>

              {/* نمایش نمره کل */}
              <div className="text-center py-2">
                <div className="text-5xl font-black tracking-tight text-white">
                  {totalWeighted}
                </div>
                <div className="text-xs text-slate-400 mt-1">جمع نمرات موزون ۵ محور</div>
              </div>

              {/* ریز سهم اوزان محورها */}
              <div className="space-y-2 text-xs border-y border-slate-800 py-4">
                <div className="flex justify-between text-slate-300">
                  <span>محور ۱ (وزن ۱۵٪):</span>
                  <span className="font-bold">{weighted1.toFixed(1)} نمره</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>محور ۲ (وزن ۲۵٪):</span>
                  <span className="font-bold">{weighted2.toFixed(1)} نمره</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>محور ۳ (وزن ۱۵٪):</span>
                  <span className="font-bold">{weighted3.toFixed(1)} نمره</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>محور ۴ (وزن ۲۵٪):</span>
                  <span className="font-bold">{weighted4.toFixed(1)} نمره</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>محور ۵ (وزن ۲۰٪):</span>
                  <span className="font-bold">{weighted5.toFixed(1)} نمره</span>
                </div>
              </div>

              {/* جعبه توصیف وضعیت نهایی */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  نتیجه و وضعیت همکاری نهایی:
                </label>

                <div className={`p-4 rounded-2xl border ${statusInfo.bg} space-y-1`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.indicator}`}></span>
                    <span>{statusInfo.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {statusInfo.desc}
                  </p>
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    امکان بازتنظیم دستی در صورت صلاحدید ارزیاب:
                  </label>
                  <select
                    name="finalRecommendation"
                    value={currentFinalStatus}
                    onChange={(e) => setOverrideStatus(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="KEY_AXIS">محور (بالای ۸۰ درصد)</option>
                    <option value="DEVELOPMENTAL_RELATION">مستعد ارتباط رشدی (۵۰ تا ۸۰ درصد)</option>
                    <option value="OCCASIONAL_RELATION">ارتباط موردی (۳۰ تا ۵۰ درصد)</option>
                    <option value="UNSUITABLE">نامناسب همکاری (زیر ۳۰ درصد)</option>
                  </select>
                </div>
              </div>

              {/* یادداشت جمع‌بندی */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  جمع‌بندی نهایی و راهکارهای اقدام:
                </label>
                <textarea
                  name="finalNotes"
                  rows={3}
                  placeholder="پیشنهاد نقش در شبکه، کارگاه‌های مورد نیاز، لیدری منطقه‌ای..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 outline-none"
                ></textarea>
              </div>

              {/* دکمه ثبت */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <span>در حال ذخیره‌سازی...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ثبت نهایی و صدور کارنامه معلم</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
