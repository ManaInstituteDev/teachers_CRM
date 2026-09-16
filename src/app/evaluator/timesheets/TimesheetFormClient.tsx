"use client";

import { useActionState, useState } from "react";
import { logTimesheetAction } from "@/app/actions/timesheet";
import { CheckCircle2, AlertCircle, Clock, UserCheck, Users, School } from "lucide-react";
import { SearchableAssistantSelect } from "@/components/SearchableAssistantSelect";
import { SearchableSchoolSelect } from "@/components/SearchableSchoolSelect";

interface AssistantOption {
  id: string;
  fullName: string;
}

interface SchoolOption {
  id: string;
  name: string;
  district: string;
}

export default function TimesheetFormClient({
  assistants,
  schools,
}: {
  assistants: AssistantOption[];
  schools: SchoolOption[];
}) {
  const [state, formAction, isPending] = useActionState(logTimesheetAction, null);
  const [workerType, setWorkerType] = useState<"EVALUATOR" | "ASSISTANT_EVALUATOR">("EVALUATOR");

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {/* انتخاب نوع نیرو: خود ارزیاب یا کمک ارزیاب */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          ثبت ساعت کارکرد برای چه کسی؟
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setWorkerType("EVALUATOR")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
              workerType === "EVALUATOR"
                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>خودم (ارزیاب)</span>
          </button>

          <button
            type="button"
            onClick={() => setWorkerType("ASSISTANT_EVALUATOR")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
              workerType === "ASSISTANT_EVALUATOR"
                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>کمک‌ارزیاب</span>
          </button>
        </div>
        <input type="hidden" name="workerType" value={workerType} />
      </div>

      {/* انتخاب کمک ارزیاب در صورت انتخاب گزینه کمک ارزیاب */}
      {workerType === "ASSISTANT_EVALUATOR" && (
        <div className="animate-in fade-in duration-200">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            انتخاب کمک‌ارزیاب همکار <span className="text-rose-500">*</span>
          </label>
          {assistants.length === 0 ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              هنوز هیچ کمک‌ارزیابی توسط مدیریت به شما متصل نشده است.
            </div>
          ) : (
            <SearchableAssistantSelect
              assistants={assistants}
              name="assistantEvaluatorId"
              required={true}
              noneLabel="-- انتخاب کمک‌ارزیاب همکار --"
              placeholder="جستجوی نام کمک‌ارزیاب..."
            />
          )}
        </div>
      )}

      {/* تاریخ */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          تاریخ انجام فعالیت
        </label>
        <input
          type="date"
          name="date"
          defaultValue={new Date().toISOString().split("T")[0]}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
        />
      </div>

      {/* مدت زمان */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          مدت زمان کارکرد
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block mb-1">ساعت:</span>
            <input
              type="number"
              name="hours"
              defaultValue="2"
              min="0"
              max="24"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-1">دقیقه:</span>
            <input
              type="number"
              name="minutes"
              defaultValue="0"
              min="0"
              max="59"
              step="5"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* مدرسه مرتبط */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          مدرسه محل فعالیت (اختیاری)
        </label>
        <SearchableSchoolSelect
          schools={schools}
          name="schoolId"
          noneLabel="-- بدون انتساب به مدرسه / فعالیت عمومی --"
          placeholder="جستجوی نام یا منطقه مدرسه..."
        />
      </div>

      {/* شرح فعالیت */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          شرح اقدامات و فعالیت انجام‌شده
        </label>
        <textarea
          name="description"
          rows={3}
          required
          placeholder="مثال: مصاحبه با دبیران ادبیات، ارزیابی میدانی امکانات مدرسه احسان، تنظیم چک‌لیست..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:border-indigo-500 outline-none"
        ></textarea>
      </div>

      {/* دکمه ارسال */}
      <button
        type="submit"
        disabled={isPending || (workerType === "ASSISTANT_EVALUATOR" && assistants.length === 0)}
        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
      >
        <Clock className="w-3.5 h-3.5" />
        <span>{isPending ? "در حال ثبت..." : "ثبت ساعت کارکرد"}</span>
      </button>
    </form>
  );
}
