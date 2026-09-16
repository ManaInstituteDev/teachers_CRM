"use client";

import { useState } from "react";
import { UserCheck, Phone, Edit2, Check, X, Loader2 } from "lucide-react";
import { updateSchoolReferrerAction } from "@/app/actions/school";

interface SchoolReferrerManagerProps {
  schoolId: string;
  initialReferrerName?: string | null;
  initialReferrerPhone?: string | null;
  isAdmin?: boolean;
}

export function SchoolReferrerManager({
  schoolId,
  initialReferrerName,
  initialReferrerPhone,
  isAdmin = true,
}: SchoolReferrerManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [referrerName, setReferrerName] = useState(initialReferrerName || "");
  const [referrerPhone, setReferrerPhone] = useState(initialReferrerPhone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await updateSchoolReferrerAction(schoolId, referrerName, referrerPhone);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-amber-950">
              معرف مدرسه (جهت هماهنگی و مراجعه ارزیاب)
            </h3>
            <p className="text-[11px] text-amber-700">
              ارزیاب اعزامی هنگام مراجعه، خود را به عنوان ارزیاب معرفی‌شده از طرف معرف معرفی می‌نماید.
            </p>
          </div>
        </div>

        {isAdmin && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold shadow-2xs transition cursor-pointer shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>ویرایش معرف</span>
          </button>
        )}
      </div>

      {success && (
        <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-xl flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>اطلاعات معرف با موفقیت ذخیره شد.</span>
        </div>
      )}

      {error && (
        <div className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-xl">
          {error}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-3 pt-2 border-t border-amber-200/60 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-amber-900 mb-1">
                نام و عنوان معرف:
              </label>
              <input
                type="text"
                value={referrerName}
                onChange={(e) => setReferrerName(e.target.value)}
                placeholder="مثال: آقای دکتر حسینی یا سرکار خانم طاهری"
                className="w-full bg-white border border-amber-300 focus:border-amber-600 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-amber-900 mb-1">
                شماره تماس معرف:
              </label>
              <input
                type="text"
                value={referrerPhone}
                onChange={(e) => setReferrerPhone(e.target.value)}
                placeholder="مثال: 09121112233"
                dir="ltr"
                className="w-full bg-white border border-amber-300 focus:border-amber-600 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setReferrerName(initialReferrerName || "");
                setReferrerPhone(initialReferrerPhone || "");
              }}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>ذخیره معرف</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/60 text-xs">
          <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200/50">
            <span className="text-slate-400 block text-[11px] mb-0.5">نام و عنوان معرف:</span>
            <span className="font-bold text-slate-800">
              {referrerName ? referrerName : "ثبت نشده"}
            </span>
          </div>

          <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200/50 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">شماره تماس معرف:</span>
              <span className="font-bold text-slate-800 font-mono" dir="ltr">
                {referrerPhone ? referrerPhone : "ثبت نشده"}
              </span>
            </div>
            {referrerPhone && (
              <a
                href={`tel:${referrerPhone}`}
                className="p-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition"
                title="تماس با معرف"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
