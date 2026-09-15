"use client";

import { useActionState } from "react";
import { updateSchoolEvaluationAction } from "@/app/actions/school";
import Link from "next/link";
import {
  School,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  Award,
  Users,
  Compass,
} from "lucide-react";

interface SchoolData {
  id: string;
  name: string;
  code: string | null;
  province: string;
  district: string;
  principalName: string | null;
  dominantApproach: string;
  approachEvidence: string | null;
  humanitiesAttitude: string | null;
  humanitiesActivities: string[];
  studentCapacities: string[];
  humanitiesReadinessLevel: string | null;
}

export function SchoolEvaluationFormClient({ school }: { school: SchoolData }) {
  const [state, formAction, isPending] = useActionState(updateSchoolEvaluationAction, null);

  const dominantApproaches = [
    { value: "EDUCATIONAL_CULTURAL", label: "تربیتی و فرهنگی", desc: "اولویت تربیت اخلاقی و فعالیت‌های فرهنگی و اجتماعی" },
    { value: "RESEARCH_ORIENTED", label: "پژوهش‌محور", desc: "تاکید بر پروژه‌های پژوهشی، سمینارها و مقاله‌نویسی" },
    { value: "SKILL_ORIENTED", label: "مهارت‌محور", desc: "آموزش مهارت‌های کاربردی، حل مسئله و کار تیمی" },
    { value: "EDUCATIONAL_GRADE_ORIENTED", label: "آموزشی و نمره‌محور", desc: "تمرکز عمده بر نتایج کنکور، نمرات و رتبه‌بندی" },
    { value: "PROBLEM_ORIENTED", label: "مسئله‌محور", desc: "طراحی پروژه‌ها پیرامون چالش‌ها و مسائل واقعی جامعه" },
    { value: "RELIGIOUS_VALUE", label: "دینی و ارزشی", desc: "رویکرد مذهبی و برنامه‌های دینی ساختارمند" },
    { value: "ARTISTIC_CREATIVE", label: "هنری و خلاق", desc: "اهمیت ویژه به تئاتر، نویسندگی، هنرهای تجسمی و خلاقیت" },
    { value: "ENTREPRENEURSHIP", label: "کارآفرینی", desc: "آموزش سواد مالی، استارتاپ و تفکر اقتصادی" },
    { value: "HYBRID", label: "ترکیبی یا چندگانه", desc: "تلفیقی از رویکردهای گوناگون تربیتی و آموزشی" },
  ];

  const humanitiesAttitudes = [
    { value: "POSITIVE_SERIOUS", label: "مثبت و جدی", desc: "ارزش‌گذاری بالا برای رشته‌های علوم انسانی و حمایت جدی کادر" },
    { value: "POSITIVE_LOW_INFO", label: "مثبت اما کم‌اطلاع", desc: "علاقه‌مند به توسعه علوم انسانی ولی نیازمند راهنمایی و آگاهی" },
    { value: "NEUTRAL", label: "خنثی یا معمولی", desc: "بدون موضع مشخص یا اولویت برابر با سایر رشته‌ها" },
    { value: "WEAK_STEREOTYPICAL", label: "ضعیف یا کلیشه‌ای", desc: "نگاه درجه دوم به علوم انسانی و تمرکز صرف بر تجربی و ریاضی" },
  ];

  const humanitiesActivityOptions = [
    "مناظره دانش‌آموزی",
    "سخنرانی و ارائه شفاهی",
    "روزنامه‌نگاری و نشریه دیواری/الکترونیک",
    "گفت‌وگوهای فلسفی و اندیشه‌ورزی",
    "آشنایی با دانشگاه و رشته‌های علوم انسانی",
    "کتاب‌خوانی، خلاصه و نقد اثر",
    "داستان‌نویسی و روایتگری",
    "تولید محتوای رسانه‌ای و پادکست",
    "رویدادهای شبیه‌سازی (دادگاه، مجلس، ...)",
    "فعالیت‌های داوطلبانه و خیریه اجتماعی",
  ];

  const studentCapacityOptions = [
    "تحلیل و استدلال منطقی",
    "نوشتن و قلم توانمند",
    "گفت‌وگو و فن بیان و ارتباط",
    "تفکر انتقادی و پرسشگری",
    "روایتگری و تولید محتوا",
    "شناخت و دغدغه مسائل اجتماعی",
    "همدلی و مشارکت تیمی",
    "روحیه پژوهشگری و جستجوگری",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      {/* دکمه بازگشت */}
      <Link
        href={`/evaluator/schools/${school.id}`}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowRight className="w-4 h-4" />
        <span>بازگشت به پرونده مدرسه {school.name}</span>
      </Link>

      {/* هدر صفحه */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-emerald-200 shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[11px] font-bold">
                  فرم ارزیابی مدرسه
                </span>
                {school.code && (
                  <span className="font-mono text-[11px] text-emerald-200/80">کد: {school.code}</span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1">{school.name}</h1>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                استان {school.province} - {school.district} {school.principalName && `| مدیر: ${school.principalName}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {state?.error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* فرم ارزیابی */}
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="schoolId" value={school.id} />

        {/* ۱. رویکرد غالب تربیتی و فرهنگی */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              ۱
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                رویکرد تربیتی و فرهنگی غالب در مدرسه
              </h2>
              <p className="text-xs text-slate-500">گفتمان و جهت‌گیری اصلی حاکم بر فضای آموزشی مدرسه</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dominantApproaches.map((item) => (
              <label
                key={item.value}
                className="relative flex flex-col p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition cursor-pointer has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50/50 has-[:checked]:ring-1 has-[:checked]:ring-emerald-500"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs sm:text-sm font-bold text-slate-800">{item.label}</span>
                  <input
                    type="radio"
                    name="dominantApproach"
                    value={item.value}
                    defaultChecked={school.dominantApproach === item.value}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{item.desc}</p>
              </label>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              شواهد و مصادیق عینی رویکرد مدرسه:
            </label>
            <textarea
              name="approachEvidence"
              rows={3}
              defaultValue={school.approachEvidence || ""}
              placeholder="مثال: برگزاری جشنواره‌های منظم علمی، اجرای طرح‌های پژوهشی با دانشگاه‌ها، اردوهای مهارتی..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
            ></textarea>
          </div>
        </div>

        {/* ۲. نگرش و ظرفیت علوم انسانی */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm">
              ۲
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                نگرش کادر و مدیریت مدرسه به حوزه علوم انسانی
              </h2>
              <p className="text-xs text-slate-500">میزان اولویت‌بخشی و اعتبار رشته‌های انسانی در مدرسه</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {humanitiesAttitudes.map((item) => (
              <label
                key={item.value}
                className="relative flex flex-col p-4 rounded-2xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/30 transition cursor-pointer has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50/50 has-[:checked]:ring-1 has-[:checked]:ring-teal-500"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs sm:text-sm font-bold text-slate-800">{item.label}</span>
                  <input
                    type="radio"
                    name="humanitiesAttitude"
                    value={item.value}
                    defaultChecked={school.humanitiesAttitude === item.value}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{item.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* ۳. سوابق فعالیت در زمینه‌های ده‌گانه علوم انسانی */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              ۳
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                سوابق و تجربیات مدرسه در فعالیت‌های علوم انسانی
              </h2>
              <p className="text-xs text-slate-500">موارد فعال در مدرسه را انتخاب کنید (چند انتخابی)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {humanitiesActivityOptions.map((act) => (
              <label
                key={act}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-indigo-50/30 hover:border-indigo-300 transition cursor-pointer has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/50"
              >
                <input
                  type="checkbox"
                  name="humanitiesActivities"
                  value={act}
                  defaultChecked={school.humanitiesActivities?.includes(act)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs sm:text-sm font-medium text-slate-800">{act}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ۴. زمینه‌های ظرفیت و استعداد دانش‌آموزان مدرسه */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              ۴
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                ظرفیت‌ها و نقاط قوت برجسته در بین دانش‌آموزان
              </h2>
              <p className="text-xs text-slate-500">استعدادهایی که در این مدرسه پررنگ‌تر مشاهده می‌شوند</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {studentCapacityOptions.map((cap) => (
              <label
                key={cap}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-amber-50/30 hover:border-amber-300 transition cursor-pointer has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50/50"
              >
                <input
                  type="checkbox"
                  name="studentCapacities"
                  value={cap}
                  defaultChecked={school.studentCapacities?.includes(cap)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs sm:text-sm font-medium text-slate-800">{cap}</span>
              </label>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              میزان آمادگی و ارزیابی نهایی مدرسه جهت اجرای برنامه‌ها:
            </label>
            <textarea
              name="humanitiesReadinessLevel"
              rows={3}
              defaultValue={school.humanitiesReadinessLevel || ""}
              placeholder="مثال: مدرسه آمادگی بسیار بالایی دارد و کادر اجرایی آماده اختصاص فضا و ساعت هفتگی هستند..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
            ></textarea>
          </div>
        </div>

        {/* دکمه ذخیره - بزرگ، لمسی و دسترسی آسان */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-bold shadow-lg shadow-emerald-900/20 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isPending ? (
              <span>در حال ذخیره‌سازی ارزیابی مدرسه...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>ثبت نهایی ارزیابی مدرسه و ذخیره در پرونده</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
