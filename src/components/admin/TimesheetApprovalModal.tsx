"use client";

import { useState } from "react";
import { approveOrReviseTimesheetAction } from "@/app/actions/timesheetApproval";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Edit3,
  Loader2,
  X,
  User,
  School,
  FileCheck,
} from "lucide-react";

interface TimesheetLogItem {
  id: string;
  workerName: string;
  workerType: string;
  evaluatorName: string;
  dateStr: string;
  durationMinutes: number;
  approvedMinutes?: number | null;
  status: "PENDING" | "APPROVED" | "REVISED" | "REJECTED";
  description?: string | null;
  schoolName?: string | null;
  adminNotes?: string | null;
}

export function TimesheetApprovalModal({ log }: { log: TimesheetLogItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // تبدیل اولیه دقایق تایید شده یا ثبت‌شده به ساعت و دقیقه
  const initialMins =
    log.approvedMinutes !== null && log.approvedMinutes !== undefined
      ? log.approvedMinutes
      : log.durationMinutes;

  const [hours, setHours] = useState(Math.floor(initialMins / 60));
  const [minutes, setMinutes] = useState(initialMins % 60);
  const [status, setStatus] = useState<"APPROVED" | "REVISED" | "REJECTED">(
    log.status === "PENDING" ? "APPROVED" : log.status
  );
  const [adminNotes, setAdminNotes] = useState(log.adminNotes || "");

  const totalNewApprovedMinutes = hours * 60 + minutes;
  const diffMinutes = totalNewApprovedMinutes - log.durationMinutes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // تعیین وضعیت هوشمند بر اساس اختلاف ساعت اگر کاربر دستی عوض نکرده باشد
    let finalStatus = status;
    if (status !== "REJECTED") {
      if (totalNewApprovedMinutes === log.durationMinutes) {
        finalStatus = "APPROVED";
      } else {
        finalStatus = "REVISED";
      }
    }

    const res = await approveOrReviseTimesheetAction({
      logId: log.id,
      approvedMinutes: status === "REJECTED" ? 0 : totalNewApprovedMinutes,
      status: finalStatus,
      adminNotes,
    });

    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else {
      setIsOpen(false);
    }
  };

  const getStatusBadge = () => {
    switch (log.status) {
      case "APPROVED":
        return (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 transition cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              تایید شد ({((log.approvedMinutes || log.durationMinutes) / 60).toFixed(1)} س)
            </span>
            <Edit3 className="w-3 h-3 text-emerald-500 opacity-60 mr-0.5" />
          </button>
        );
      case "REVISED":
        return (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80 hover:bg-purple-100 transition cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              تعدیل مدیر ({((log.approvedMinutes || 0) / 60).toFixed(1)} س)
            </span>
            <Edit3 className="w-3 h-3 text-purple-500 opacity-60 mr-0.5" />
          </button>
        );
      case "REJECTED":
        return (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 transition cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>رد شده</span>
            <Edit3 className="w-3 h-3 text-rose-500 opacity-60 mr-0.5" />
          </button>
        );
      default:
        return (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition cursor-pointer animate-pulse"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>بررسی و تایید</span>
          </button>
        );
    }
  };

  return (
    <>
      {getStatusBadge()}

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95">
            {/* هدر مدال */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    تایید و تعدیل ساعت کارکرد
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    بررسی ساعت اعلامی ارزیاب و ثبت ساعت نهایی مصوب
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* خلاصه اطلاعات لاگ فعلی */}
            <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-2 border border-slate-200/70">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">نیروی مجری:</span>
                <span className="font-bold text-slate-900">
                  {log.workerName} ({log.workerType})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">تاریخ فعالیت:</span>
                <span className="font-mono text-slate-700">{log.dateStr}</span>
              </div>
              {log.schoolName && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">مدرسه مربوطه:</span>
                  <span className="font-bold text-indigo-700">{log.schoolName}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span className="text-slate-500">ساعت ثبت‌شده توسط ارزیاب:</span>
                <span className="font-black text-purple-700 text-sm">
                  {Math.floor(log.durationMinutes / 60)} ساعت و {log.durationMinutes % 60} دقیقه
                  <span className="text-[11px] font-normal text-slate-400 mr-1">
                    ({(log.durationMinutes / 60).toFixed(1)} ساعت)
                  </span>
                </span>
              </div>
              {log.description && (
                <div className="pt-2 text-slate-600 border-t border-slate-200/50">
                  <span className="font-semibold text-slate-700">شرح فعالیت: </span>
                  {log.description}
                </div>
              )}
            </div>

            {/* فرم ثبت ساعت تایید شده */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* انتخاب وضعیت کلی */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  تصمیم مدیر:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("APPROVED");
                      setHours(Math.floor(log.durationMinutes / 60));
                      setMinutes(log.durationMinutes % 60);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      status === "APPROVED" && diffMinutes === 0
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    تایید بدون تغییر
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("REVISED")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      status === "REVISED" || (status !== "REJECTED" && diffMinutes !== 0)
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    تعدیل ساعت (کمتر/بیشتر)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStatus("REJECTED");
                      setHours(0);
                      setMinutes(0);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      status === "REJECTED"
                        ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    رد کردن کارکرد
                  </button>
                </div>
              </div>

              {/* ورودی ساعت و دقیقه تایید شده */}
              {status !== "REJECTED" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    ساعت فعالیت تایید شده نهایی:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="block text-[11px] text-slate-500 mb-1">ساعت:</span>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={hours}
                        onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] text-slate-500 mb-1">دقیقه:</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        step="5"
                        value={minutes}
                        onChange={(e) =>
                          setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))
                        }
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  {/* نمایش تفاوت با ساعت ثبت‌شده ارزیاب */}
                  <div className="p-3 rounded-xl bg-slate-100/80 text-xs flex items-center justify-between">
                    <span className="text-slate-600">مجموع ساعت تایید شده:</span>
                    <span className="font-black text-slate-900">
                      {(totalNewApprovedMinutes / 60).toFixed(1)} ساعت
                    </span>
                  </div>

                  {diffMinutes !== 0 && (
                    <div
                      className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                        diffMinutes < 0
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>
                        {diffMinutes < 0
                          ? `${Math.abs(diffMinutes)} دقیقه (${(
                              Math.abs(diffMinutes) / 60
                            ).toFixed(1)} س) کمتر از ساعت ارزیاب`
                          : `${diffMinutes} دقیقه (${(diffMinutes / 60).toFixed(
                              1
                            )} س) بیشتر از ساعت ارزیاب`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* یادداشت یا دلیل تعدیل */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  توضیحات و یادداشت مدیر (اختیاری):
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="علت تعدیل، توضیحات تسویه یا یادداشت مدیریتی..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl p-3 text-xs outline-none"
                />
              </div>

              {/* دکمه‌های اقدام */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>ثبت و ذخیره تاییدیه</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
