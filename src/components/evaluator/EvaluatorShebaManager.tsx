"use client";

import { useState } from "react";
import {
  updateEvaluatorShebaAction,
  updateAssistantShebaAction,
} from "@/app/actions/timesheetApproval";
import {
  CreditCard,
  Check,
  Edit2,
  Loader2,
  Users,
  ShieldCheck,
  AlertCircle,
  Building,
} from "lucide-react";

interface AssistantItem {
  id: string;
  fullName: string;
  phone?: string | null;
  nationalCode?: string | null;
  shebaNumber?: string | null;
}

interface EvaluatorShebaManagerProps {
  evaluatorId: string;
  evaluatorName: string;
  evaluatorSheba?: string | null;
  assistants: AssistantItem[];
}

export function EvaluatorShebaManager({
  evaluatorId,
  evaluatorName,
  evaluatorSheba,
  assistants,
}: EvaluatorShebaManagerProps) {
  // شماره شبای خود ارزیاب
  const [mySheba, setMySheba] = useState(evaluatorSheba || "");
  const [myEditing, setMyEditing] = useState(false);
  const [myLoading, setMyLoading] = useState(false);
  const [mySaved, setMySaved] = useState(false);
  const [myError, setMyError] = useState<string | null>(null);

  // حالت ویرایش شماره شبای کمک‌ارزیابان
  const [assistantShebas, setAssistantShebas] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    assistants.forEach((a) => {
      init[a.id] = a.shebaNumber || "";
    });
    return init;
  });
  const [editingAssistantId, setEditingAssistantId] = useState<string | null>(null);
  const [assistantLoading, setAssistantLoading] = useState<string | null>(null);
  const [assistantSaved, setAssistantSaved] = useState<string | null>(null);
  const [assistantError, setAssistantError] = useState<string | null>(null);

  // ذخیره شبای خود ارزیاب
  const handleSaveMySheba = async (e: React.FormEvent) => {
    e.preventDefault();
    setMyLoading(true);
    setMyError(null);

    let clean = mySheba.replace(/\s+/g, "").toUpperCase();
    if (clean && !clean.startsWith("IR") && /^\d+$/.test(clean)) {
      clean = "IR" + clean;
    }

    const res = await updateEvaluatorShebaAction(evaluatorId, clean);
    setMyLoading(false);

    if (res?.error) {
      setMyError(res.error);
    } else {
      setMySheba(clean);
      setMySaved(true);
      setMyEditing(false);
      setTimeout(() => setMySaved(false), 3500);
    }
  };

  // ذخیره شبای کمکیار
  const handleSaveAssistantSheba = async (assistantId: string) => {
    setAssistantLoading(assistantId);
    setAssistantError(null);

    const val = assistantShebas[assistantId] || "";
    let clean = val.replace(/\s+/g, "").toUpperCase();
    if (clean && !clean.startsWith("IR") && /^\d+$/.test(clean)) {
      clean = "IR" + clean;
    }

    const res = await updateAssistantShebaAction(assistantId, clean);
    setAssistantLoading(null);

    if (res?.error) {
      setAssistantError(res.error);
    } else {
      setAssistantShebas((prev) => ({ ...prev, [assistantId]: clean }));
      setAssistantSaved(assistantId);
      setEditingAssistantId(null);
      setTimeout(() => setAssistantSaved(null), 3500);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
      {/* سربرگ بخش */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              اطلاعات تسویه حساب و شماره شبا
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              جهت واریز حق‌الزحمه ارزیابی‌ها، شماره شبای بانکی خود و کمک‌ارزیابان متصل به خود را ثبت فرمایید.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-xs font-bold self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>سیستم تسویه متمرکز</span>
        </div>
      </div>

      {/* ۱. شماره شبای خود ارزیاب */}
      <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/70 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              شماره شبای شما ({evaluatorName})
            </span>
          </div>
          {mySaved && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-lg animate-in fade-in">
              ✓ شماره شبا با موفقیت ذخیره شد
            </span>
          )}
          {myError && (
            <span className="text-xs font-bold text-rose-700 bg-rose-100/70 px-2.5 py-0.5 rounded-lg">
              {myError}
            </span>
          )}
        </div>

        {!myEditing && mySheba ? (
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-center gap-3">
              <Building className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">شماره شبا ثبت‌شده:</span>
                <span className="font-mono text-sm sm:text-base font-black text-indigo-900 tracking-wider select-all" dir="ltr">
                  {mySheba}
                </span>
              </div>
            </div>

            <button
              onClick={() => setMyEditing(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>ویرایش</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveMySheba} className="space-y-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={mySheba}
                  onChange={(e) => setMySheba(e.target.value)}
                  placeholder="IR..."
                  dir="ltr"
                  className="w-full font-mono text-sm bg-white border border-indigo-300 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none transition"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={myLoading}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {myLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>ذخیره شماره شبا</span>
                </button>
                {myEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setMyEditing(false);
                      setMySheba(evaluatorSheba || "");
                    }}
                    className="px-3 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    انصراف
                  </button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              * شماره شبا باید با IR و ۲۴ رقم انگلیسی بدون خط فاصله یا فاصله خالی وارد شود.
            </p>
          </form>
        )}
      </div>

      {/* ۲. شماره شبای کمک‌ارزیابان متصل */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600" />
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              شماره شبای کمک‌ارزیابان همکار ({assistants.length} نفر)
            </h4>
          </div>
          {assistantError && (
            <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-lg">
              {assistantError}
            </span>
          )}
        </div>

        {assistants.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200/60">
            در حال حاضر هیچ کمک‌ارزیابی به شما تخصیص داده نشده است.
          </div>
        ) : (
          <div className="space-y-2.5">
            {assistants.map((asst) => {
              const currentVal = assistantShebas[asst.id] || "";
              const isEditing = editingAssistantId === asst.id || !currentVal;
              const isLoading = assistantLoading === asst.id;
              const isSaved = assistantSaved === asst.id;

              return (
                <div
                  key={asst.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-300 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {asst.fullName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200/60">
                        کمک‌ارزیاب
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      {asst.phone && <span>تماس: {asst.phone}</span>}
                      {asst.nationalCode && <span>کدملی: {asst.nationalCode}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {isSaved && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        ✓ ثبت شد
                      </span>
                    )}

                    {!isEditing && currentVal ? (
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                        <span className="font-mono text-xs sm:text-sm font-black text-slate-800 tracking-wider select-all" dir="ltr">
                          {currentVal}
                        </span>
                        <button
                          onClick={() => setEditingAssistantId(asst.id)}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                          title="ویرایش شبا"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 w-full md:w-auto">
                        <input
                          type="text"
                          value={currentVal}
                          onChange={(e) =>
                            setAssistantShebas((prev) => ({
                              ...prev,
                              [asst.id]: e.target.value,
                            }))
                          }
                          placeholder="IR..."
                          dir="ltr"
                          className="font-mono text-xs bg-slate-50 border border-sky-300 focus:bg-white focus:border-sky-500 rounded-lg px-2.5 py-1.5 w-full md:w-56 outline-none text-slate-900"
                        />
                        <button
                          onClick={() => handleSaveAssistantSheba(asst.id)}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          <span>ثبت</span>
                        </button>
                        {editingAssistantId === asst.id && currentVal && (
                          <button
                            onClick={() => setEditingAssistantId(null)}
                            className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition cursor-pointer"
                          >
                            انصراف
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
