"use client";

import { useActionState, useState } from "react";
import { createSchoolAction } from "@/app/actions/school";
import Link from "next/link";
import {
  ArrowRight,
  School,
  Building2,
  BookOpen,
  Sparkles,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

const HUMANITIES_ACTIVITIES_LIST = [
  "مناظره",
  "سخنرانی و ارائه",
  "روزنامه‌نگاری و نشریه",
  "داستان‌نویسی و روایتگری",
  "تاریخ شفاهی",
  "پژوهش اجتماعی",
  "فعالیت‌های مدنی و داوطلبانه",
  "بازدیدهای فرهنگی",
  "گفت‌وگوهای فلسفی",
  "آشنایی با دانشگاه و رشته‌های علوم انسانی",
  "وجود معلمان علاقه‌مند یا فعال در علوم انسانی",
];

const STUDENT_CAPACITIES_LIST = [
  "تحلیل و استدلال",
  "نوشتن",
  "گفت‌وگو و ارتباط",
  "شناخت مسائل اجتماعی",
  "تاریخ و فرهنگ",
  "تفکر انتقادی",
  "روایتگری و تولید محتوا",
];

export default function NewSchoolPage() {
  const [state, formAction, isPending] = useActionState(createSchoolAction, null);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedCapacities, setSelectedCapacities] = useState<string[]>([]);

  const toggleActivity = (item: string) => {
    setSelectedActivities((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleCapacity = (item: string) => {
    setSelectedCapacities((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      {/* دکمه بازگشت */}
      <Link
        href="/evaluator"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowRight className="w-4 h-4" />
        <span>بازگشت به داشبورد</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-8">
        <div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
            <School className="w-6 h-6" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            توصیف و شناسنامه مدرسه
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ثبت اطلاعات ساختاری، رویکرد تربیتی و ظرفیت‌سنجی مدرسه در حوزه علوم انسانی
          </p>
        </div>

        {state?.error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-8">
          {/* بخش ۱: اطلاعات پایه و شناسایی */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                ۱
              </span>
              <span>اطلاعات پایه و شناسایی مدرسه</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  نام مدرسه <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="مثال: دبیرستان نمونه علامه طباطبایی"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  کد مدرسه (در صورت دسترسی)
                </label>
                <input
                  type="text"
                  name="code"
                  placeholder="مثال: SCH-9821"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm transition outline-none font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  استان و شهرستان
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="province"
                    defaultValue="تهران"
                    placeholder="استان"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs transition outline-none"
                  />
                  <input
                    type="text"
                    name="city"
                    defaultValue="تهران"
                    placeholder="شهرستان"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs transition outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  منطقه / ناحیه آموزش و پرورش <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  required
                  placeholder="مثال: منطقه ۶ یا ناحیه ۲"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                نشانی یا محله مدرسه
              </label>
              <input
                type="text"
                name="address"
                placeholder="خیابان، محله و توضیحات دسترسی"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
              />
            </div>
          </div>

          {/* بخش ۲: نوع و ساختار مدرسه */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                ۲
              </span>
              <span>نوع و ساختار مدرسه</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  نوع مالکیت و اداره
                </label>
                <select
                  name="ownershipType"
                  defaultValue="GOVERNMENTAL"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
                >
                  <option value="GOVERNMENTAL">دولتی</option>
                  <option value="NON_GOVERNMENTAL">غیردولتی</option>
                  <option value="BOARD_OF_TRUSTEES">هیئت‌امنایی</option>
                  <option value="NEMOONE_DOLATI">نمونه دولتی</option>
                  <option value="SAMPAD">استعدادهای درخشان (سمپاد)</option>
                  <option value="SHAHED">شاهد</option>
                  <option value="ORGANIZATION_TIED">وابسته به نهاد یا سازمان خاص</option>
                  <option value="VOCATIONAL">هنرستان</option>
                  <option value="HYBRID_SPECIAL">مدرسه خاص یا ترکیبی</option>
                  <option value="OTHER">سایر</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  وضعیت پذیرش دانش‌آموز
                </label>
                <select
                  name="admissionType"
                  defaultValue="PUBLIC"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
                >
                  <option value="PUBLIC">ثبت‌نام عمومی</option>
                  <option value="EXAM_BASED">پذیرش بر اساس آزمون</option>
                  <option value="INTERVIEW_RESUME">پذیرش بر اساس مصاحبه یا بررسی سوابق</option>
                  <option value="REGIONAL">پذیرش منطقه‌ای</option>
                  <option value="SELECTIVE_LIMITED">پذیرش محدود یا گزینشی</option>
                  <option value="HYBRID">ترکیبی</option>
                </select>
              </div>
            </div>
          </div>

          {/* بخش ۳: رویکرد تربیتی و فرهنگی مدرسه */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                ۳
              </span>
              <span>رویکرد تربیتی و فرهنگی مدرسه</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                رویکرد غالب مدرسه
              </label>
              <select
                name="dominantApproach"
                defaultValue="EDUCATIONAL_CULTURAL"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
              >
                <option value="EDUCATIONAL_GRADE_ORIENTED">آموزشی و نمره‌محور</option>
                <option value="EDUCATIONAL_CULTURAL">تربیتی و فرهنگی</option>
                <option value="SKILL_ORIENTED">مهارت‌محور</option>
                <option value="RESEARCH_ORIENTED">پژوهش‌محور</option>
                <option value="PROBLEM_ORIENTED">مسئله‌محور</option>
                <option value="RELIGIOUS_VALUE">دینی و ارزشی</option>
                <option value="ARTISTIC_CREATIVE">هنری و خلاق</option>
                <option value="ENTREPRENEURSHIP">کارآفرینی</option>
                <option value="HYBRID">ترکیبی</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                شواهد عملی رویکرد مدرسه
              </label>
              <textarea
                name="approachEvidence"
                rows={3}
                placeholder="بهتر است صرفاً عنوان‌های کلی ثبت نشود؛ بلکه با شواهد عملی، نمونه رویدادها، فعالیت‌ها یا دستاوردها تکمیل شود..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl p-3 text-xs leading-relaxed transition outline-none"
              ></textarea>
            </div>
          </div>

          {/* بخش ۴: ظرفیت مدرسه در حوزه علوم انسانی */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                ۴
              </span>
              <span>ظرفیت مدرسه در حوزه علوم انسانی</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                نگرش غالب مدیر و معلمان نسبت به علوم انسانی
              </label>
              <select
                name="humanitiesAttitude"
                defaultValue="POSITIVE_SERIOUS"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
              >
                <option value="POSITIVE_SERIOUS">مثبت و جدی</option>
                <option value="POSITIVE_LOW_INFO">مثبت اما کم‌اطلاع</option>
                <option value="NEUTRAL">خنثی</option>
                <option value="WEAK_STEREOTYPICAL">ضعیف یا کلیشه‌ای</option>
              </select>
            </div>

            {/* سوابق فعالیت‌های ۱۰ گانه */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                سابقه مدرسه در زمینه‌های علوم انسانی (موارد دارای سابقه را انتخاب کنید):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {HUMANITIES_ACTIVITIES_LIST.map((item) => {
                  const isChecked = selectedActivities.includes(item);
                  return (
                    <label
                      key={item}
                      onClick={() => toggleActivity(item)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition ${
                        isChecked
                          ? "bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold"
                          : "bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="humanitiesActivities"
                        value={item}
                        checked={isChecked}
                        onChange={() => {}}
                        className="hidden"
                      />
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isChecked
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isChecked && <CheckCircle className="w-3.5 h-3.5" />}
                      </div>
                      <span>{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* پتانسیل دانش‌آموزان */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                دانش‌آموزان دارای ظرفیت در:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STUDENT_CAPACITIES_LIST.map((item) => {
                  const isChecked = selectedCapacities.includes(item);
                  return (
                    <label
                      key={item}
                      onClick={() => toggleCapacity(item)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition ${
                        isChecked
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                          : "bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="studentCapacities"
                        value={item}
                        checked={isChecked}
                        onChange={() => {}}
                        className="hidden"
                      />
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isChecked
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isChecked && <CheckCircle className="w-3.5 h-3.5" />}
                      </div>
                      <span>{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* میزان آمادگی */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                میزان آمادگی مدرسه برای اجرای برنامه‌های مرتبط با علوم انسانی
              </label>
              <textarea
                name="humanitiesReadinessLevel"
                rows={3}
                placeholder="توضیحاتی پیرامون فضا، همکاری مدیریت، آمادگی کادر و زمان‌بندی..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl p-3 text-xs leading-relaxed transition outline-none"
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
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-semibold shadow-md shadow-sky-600/20 transition cursor-pointer"
            >
              {isPending ? "در حال ثبت شناسنامه..." : "ثبت و ذخیره شناسنامه مدرسه"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
