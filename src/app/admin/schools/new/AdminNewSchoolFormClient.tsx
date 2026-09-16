"use client";

import { useActionState } from "react";
import { createBasicSchoolAction } from "@/app/actions/school";
import Link from "next/link";
import {
  ArrowRight,
  School,
  Building2,
  Phone,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import SearchableEvaluatorSelect from "@/components/SearchableEvaluatorSelect";

interface EvaluatorOption {
  id: string;
  fullName: string;
  username: string;
  phone?: string | null;
}

export function AdminNewSchoolFormClient({
  evaluators,
}: {
  evaluators: EvaluatorOption[];
}) {
  const [state, formAction, isPending] = useActionState(createBasicSchoolAction, null);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      {/* دکمه بازگشت */}
      <Link
        href="/admin/schools"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowRight className="w-4 h-4" />
        <span>بازگشت به لیست مدارس</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-8">
        {/* هدر فرم */}
        <div className="border-b border-slate-100 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <School className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            تعریف و افزودن مدرسه جدید
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ثبت اطلاعات پایه و ساختاری مدرسه و انتساب آن به ارزیاب جهت ورود به چرخه ارزیابی
          </p>
        </div>

        {/* نمایش پیام خطا */}
        {state?.error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold">
            {state.error}
          </div>
        )}

        {/* فرم ثبت */}
        <form action={formAction} className="space-y-6">
          {/* بخش انتساب ارزیاب (شاخص اصلی) */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
            <label className="block text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>ارزیاب متصل به این مدرسه (لینک به کارتابل ارزیاب)</span>
            </label>
            <SearchableEvaluatorSelect
              evaluators={evaluators}
              name="assignedEvaluatorId"
              defaultValue=""
              noneValue=""
              noneLabel="-- بدون انتساب فعلی (مدرسه در کارتابل هیچ ارزیابی نمایش داده نمی‌شود) --"
              placeholder="جستجوی نام یا نام‌کاربری ارزیاب..."
              buttonClassName="bg-white border-emerald-300 focus:border-emerald-600 rounded-xl"
            />
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              با انتخاب ارزیاب، این مدرسه منحصراً در پنل و کارتابل آن ارزیاب قابل مشاهده خواهد بود و او می‌تواند کادر مدرسه را ارزیابی کند.
            </p>
          </div>

          {/* ۱. مشخصات عمومی */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>۱. مشخصات هویتی و ثبتی مدرسه</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نام مدرسه <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="مثلاً: دبیرستان نمونه دولتی رشد"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  کد مدرسه (اختیاری)
                </label>
                <input
                  type="text"
                  name="code"
                  placeholder="مثلاً: 12345678"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  استان <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="province"
                  defaultValue="تهران"
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  شهرستان / شهر <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  defaultValue="تهران"
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  منطقه آموزش و پرورش <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  required
                  placeholder="مثلاً: منطقه ۲"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نشانی دقیق مدرسه (خیابان، پلاک، ...)
              </label>
              <input
                type="text"
                name="address"
                placeholder="مثلاً: خیابان آزادی، خیابان حبیب‌الهی، کوچه..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition"
              />
            </div>
          </div>

          {/* ۲. نوع مالکیت و شیوه پذیرش */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <School className="w-4 h-4 text-sky-600" />
              <span>۲. ساختار سازمانی و پذیرش</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نوع مالکیت / اداره
                </label>
                <select
                  name="ownershipType"
                  defaultValue="GOVERNMENTAL"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition"
                >
                  <option value="GOVERNMENTAL">دولتی</option>
                  <option value="NON_GOVERNMENTAL">غیردولتی</option>
                  <option value="BOARD_OF_TRUSTEES">هیئت‌امنایی</option>
                  <option value="NEMOONE_DOLATI">نمونه دولتی</option>
                  <option value="SAMPAD">استعدادهای درخشان (سمپاد)</option>
                  <option value="SHAHED">شاهد</option>
                  <option value="VOCATIONAL">هنرستان</option>
                  <option value="ORGANIZATION_TIED">وابسته به نهاد یا سازمان خاص</option>
                  <option value="OTHER">سایر / خاص</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  شیوه پذیرش دانش‌آموزان
                </label>
                <select
                  name="admissionType"
                  defaultValue="PUBLIC"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition"
                >
                  <option value="PUBLIC">ثبت‌نام عمومی (محدوده جغرافیایی)</option>
                  <option value="EXAM_BASED">پذیرش بر اساس آزمون ورودی</option>
                  <option value="INTERVIEW_RESUME">مصاحبه، گزینش و بررسی سوابق</option>
                  <option value="REGIONAL">پذیرش منطقه‌ای</option>
                  <option value="SELECTIVE_LIMITED">پذیرش محدود یا خاص</option>
                  <option value="HYBRID">ترکیبی</option>
                </select>
              </div>
            </div>
          </div>

          {/* ۳. تماس و مشخصات اداری */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>۳. اطلاعات تماس و مدیریت مدرسه</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نام مدیر مدرسه (اختیاری)
                </label>
                <input
                  type="text"
                  name="principalName"
                  placeholder="مثلاً: دکتر محمدی"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  شماره تماس مدرسه (اختیاری)
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="مثلاً: 021-88997766"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            {/* مشخصات معرف مدرسه */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-600" />
                <span className="text-xs sm:text-sm font-bold text-amber-950">
                  مشخصات معرف مدرسه (جهت مراجعه و هماهنگی ارزیاب)
                </span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                ارزیاب هنگام مراجعه به مدرسه، این مشخصات را در کارتابل خود می‌بیند تا بداند این مدرسه توسط چه شخصی معرفی شده و خود را به چه کسی معرفی کند.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1.5">
                    نام و عنوان معرف (اختیاری)
                  </label>
                  <input
                    type="text"
                    name="referrerName"
                    placeholder="مثلاً: آقای دکتر حسینی یا سرکار خانم طاهری"
                    className="w-full bg-white border border-amber-200 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1.5">
                    شماره تماس معرف (اختیاری)
                  </label>
                  <input
                    type="text"
                    name="referrerPhone"
                    placeholder="مثلاً: 09121112233"
                    className="w-full bg-white border border-amber-200 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                یادداشت اولیه مدیر (اختیاری)
              </label>
              <textarea
                name="notes"
                rows={2}
                placeholder="توضیحات تکمیلی یا نکات اولیه درباره مدرسه..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition"
              />
            </div>
          </div>

          {/* راهنمای ارزیابی */}
          <div className="bg-sky-50 border border-sky-200/80 rounded-2xl p-4 text-sky-800 text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              <span>روال ارزیابی شایستگی‌ها:</span>
            </p>
            <p className="text-sky-700 leading-relaxed">
              پس از ثبت مدرسه و انتخاب ارزیاب، ارزیاب منتخب می‌تواند وارد کارتابل خود شده و فرآیند ارزیابی تخصصی معلمان و کادر مدرسه را آغاز کند.
            </p>
          </div>

          {/* دکمه‌های اقدام */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/admin/schools"
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition"
            >
              انصراف
            </Link>

            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <School className="w-4 h-4" />
              <span>{isPending ? "در حال ذخیره..." : "ثبت و انتساب مدرسه"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
