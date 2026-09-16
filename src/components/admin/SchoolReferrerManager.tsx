"use client";

import { useState } from "react";
import { UserCheck, Phone, Edit2, Check, X, Loader2, Plus, Trash2 } from "lucide-react";
import {
  updateSchoolReferrerAction,
  addSchoolReferrerAction,
  deleteSchoolReferrerAction,
} from "@/app/actions/school";

interface ReferrerItem {
  id: string;
  fullName: string;
  phone?: string | null;
  notes?: string | null;
}

interface SchoolReferrerManagerProps {
  schoolId: string;
  initialReferrerName?: string | null;
  initialReferrerPhone?: string | null;
  referrers?: ReferrerItem[];
  isAdmin?: boolean;
}

export function SchoolReferrerManager({
  schoolId,
  initialReferrerName,
  initialReferrerPhone,
  referrers = [],
  isAdmin = true,
}: SchoolReferrerManagerProps) {
  const [isEditingPrimary, setIsEditingPrimary] = useState(false);
  const [referrerName, setReferrerName] = useState(initialReferrerName || "");
  const [referrerPhone, setReferrerPhone] = useState(initialReferrerPhone || "");
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSavePrimary = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await updateSchoolReferrerAction(schoolId, referrerName, referrerPhone);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess("اطلاعات معرف اصلی با موفقیت ذخیره شد.");
      setIsEditingPrimary(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleAddNewReferrer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) {
      setError("نام معرف الزامی است.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await addSchoolReferrerAction(schoolId, newFullName, newPhone, newNotes);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess("معرف جدید با موفقیت اضافه شد.");
      setNewFullName("");
      setNewPhone("");
      setNewNotes("");
      setIsAddingNew(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleDeleteReferrer = async (referrerId: string) => {
    if (!confirm("آیا از حذف این معرف اطمینان دارید؟")) return;

    setDeletingId(referrerId);
    setError(null);
    setSuccess(null);

    const res = await deleteSchoolReferrerAction(referrerId, schoolId);
    setDeletingId(null);

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess("معرف مورد نظر با موفقیت حذف شد.");
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs sm:text-sm text-amber-950">
                معرف‌های مدرسه (جهت هماهنگی و مراجعه ارزیاب)
              </h3>
              {referrers.length > 0 && (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
                  {referrers.length} معرف
                </span>
              )}
            </div>
            <p className="text-[11px] text-amber-700 mt-0.5">
              ارزیاب اعزامی هنگام مراجعه، خود را به عنوان ارزیاب معرفی‌شده از طرف معرف معرفی می‌نماید.
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            {!isAddingNew && (
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن معرف</span>
              </button>
            )}
            {!isEditingPrimary && (
              <button
                type="button"
                onClick={() => setIsEditingPrimary(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>ویرایش خلاصه</span>
              </button>
            )}
          </div>
        )}
      </div>

      {success && (
        <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
          {error}
        </div>
      )}

      {/* فرم افزودن معرف جدید */}
      {isAddingNew && (
        <form onSubmit={handleAddNewReferrer} className="p-3.5 bg-white rounded-xl border border-amber-300 space-y-3 animate-in fade-in">
          <div className="text-xs font-bold text-amber-900 flex items-center justify-between">
            <span>ثبت معرف جدید برای این مدرسه:</span>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                نام و نام خانوادگی معرف: *
              </label>
              <input
                type="text"
                required
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="مثال: آقای رضا نیک نژاد"
                className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                شماره تماس معرف:
              </label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="مثال: 09120762237"
                dir="ltr"
                className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                توضیحات / سمت:
              </label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="مثال: مدیر سابق یا هماهنگ‌کننده"
                className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>افزودن</span>
            </button>
          </div>
        </form>
      )}

      {/* فرم ویرایش خلاصه معرف مدرسه */}
      {isEditingPrimary && (
        <form onSubmit={handleSavePrimary} className="space-y-3 pt-2 border-t border-amber-200/60 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-amber-900 mb-1">
                عنوان / خلاصه معرف مدرسه:
              </label>
              <input
                type="text"
                value={referrerName}
                onChange={(e) => setReferrerName(e.target.value)}
                placeholder="مثال: آقای طاهری یا آقای سنگتراشان"
                className="w-full bg-white border border-amber-300 focus:border-amber-600 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-amber-900 mb-1">
                شماره تماس پیش‌فرض معرف:
              </label>
              <input
                type="text"
                value={referrerPhone}
                onChange={(e) => setReferrerPhone(e.target.value)}
                placeholder="مثال: 09120762237"
                dir="ltr"
                className="w-full bg-white border border-amber-300 focus:border-amber-600 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setIsEditingPrimary(false);
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
              <span>ذخیره خلاصه</span>
            </button>
          </div>
        </form>
      )}

      {/* نمایش لیست تمام معرف‌های ثبت‌شده */}
      {referrers.length > 0 ? (
        <div className="space-y-2 pt-2 border-t border-amber-200/60">
          <div className="text-[11px] font-bold text-amber-900 flex items-center justify-between">
            <span>لیست تمام معرف‌های این مدرسه:</span>
            <span className="text-[10px] text-amber-700">کلیک روی شماره جهت برقراری تماس</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {referrers.map((ref) => (
              <div
                key={ref.id}
                className="p-2.5 rounded-xl bg-white/95 border border-amber-200/80 flex items-center justify-between gap-2 shadow-2xs hover:border-amber-400 transition"
              >
                <div className="truncate flex-1">
                  <div className="font-bold text-amber-950 text-xs truncate">
                    {ref.fullName}
                  </div>
                  {ref.notes && (
                    <div className="text-[10px] text-slate-400 truncate">
                      {ref.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {ref.phone && (
                    <a
                      href={`tel:${ref.phone}`}
                      className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-200/80 transition"
                      dir="ltr"
                      title="تماس مستقیم با معرف"
                    >
                      <Phone className="w-3 h-3 text-amber-600" />
                      <span>{ref.phone}</span>
                    </a>
                  )}

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteReferrer(ref.id)}
                      disabled={deletingId === ref.id}
                      className="p-1 text-slate-300 hover:text-rose-600 rounded-md transition"
                      title="حذف معرف"
                    >
                      {deletingId === ref.id ? (
                        <Loader2 className="w-3 h-3 animate-spin text-rose-600" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* نمایش تکی در صورتی که معرف چندتایی ثبت نشده */
        !isEditingPrimary && (
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
        )
      )}
    </div>
  );
}

