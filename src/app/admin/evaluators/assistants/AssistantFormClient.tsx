"use client";

import { useActionState } from "react";
import { createAssistantEvaluatorAction } from "@/app/actions/assistantEvaluator";
import { UserPlus, AlertCircle, CheckCircle2, Users, ShieldAlert } from "lucide-react";
import SearchableEvaluatorSelect from "@/components/SearchableEvaluatorSelect";

interface EvaluatorOption {
  id: string;
  fullName: string;
}

export default function AssistantFormClient({
  evaluators,
}: {
  evaluators: EvaluatorOption[];
}) {
  const [state, formAction, isPending] = useActionState(createAssistantEvaluatorAction, null);

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

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          نام و نام خانوادگی کمک‌ارزیاب <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="fullName"
          required
          placeholder="مثال: حسین رضایی"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:border-indigo-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          ارزیاب مسئول (لینک به ارزیاب) <span className="text-rose-500">*</span>
        </label>
        <SearchableEvaluatorSelect
          evaluators={evaluators}
          name="evaluatorId"
          defaultValue=""
          noneValue=""
          noneLabel="-- انتخاب ارزیاب مسئول --"
          required={true}
          placeholder="جستجوی نام ارزیاب..."
        />
        <p className="text-[11px] text-slate-400 mt-1">
          این کمک‌ارزیاب در پنل ارزیاب انتخاب‌شده نمایش داده خواهد شد.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            شماره همراه
          </label>
          <input
            type="tel"
            name="phone"
            placeholder="۰۹۳۵۱۲۳۴۵۶۷"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none font-mono"
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
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          توضیحات و حوزه فعالیت کمک‌ارزیاب
        </label>
        <textarea
          name="notes"
          rows={2}
          placeholder="مثال: مسئول پیگیری مدارک و ارزیابی مدارس منطقه ۳..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:border-indigo-500 outline-none"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isPending || evaluators.length === 0}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
      >
        <UserPlus className="w-4 h-4" />
        <span>{isPending ? "در حال ثبت..." : "افزودن و اتصال به ارزیاب"}</span>
      </button>
    </form>
  );
}
