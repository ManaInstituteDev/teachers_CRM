"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  ArrowUpRight,
  ChevronDown,
  X,
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
  mode?: "prompt" | "manager";
  collapsible?: boolean;
}

export function EvaluatorShebaManager({
  evaluatorId,
  evaluatorName,
  evaluatorSheba,
  assistants,
  mode = "prompt",
  collapsible = false,
}: EvaluatorShebaManagerProps) {
  const router = useRouter();

  // شماره شبای خود ارزیاب
  const [mySheba, setMySheba] = useState(evaluatorSheba || "");
  const [myEditing, setMyEditing] = useState(mode === "prompt" && !evaluatorSheba);
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

  // وضعیت باز/بسته بودن برای حالت collapsible در صفحه ثبت فعالیت
  // در صورتی که شبایی هنوز ثبت نشده باشد باز است، و اگر همه ثبت شده باشند به صورت پیش‌فرض بسته است
  const [isOpen, setIsOpen] = useState(
    !collapsible || !evaluatorSheba || assistants.some((a) => !a.shebaNumber)
  );

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
      router.refresh();
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
      router.refresh();
      setTimeout(() => setAssistantSaved(null), 3500);
    }
  };

  // ==========================================
  // حالت ۱: Prompt (داشبورد ارزیاب /evaluator)
  // فقط کسانی که هنوز شبا ثبت نکرده‌اند نمایش داده می‌شوند
  // اگر همه ثبت کرده باشند، اصلاً نمایش داده نمی‌شود!
  // ==========================================
  if (mode === "prompt") {
    const isMyShebaMissing = !mySheba || !mySheba.trim();
    // فقط کمک‌یارهایی که شبا ندارند
    const missingAssistants = assistants.filter(
      (a) => !assistantShebas[a.id]?.trim() && !a.shebaNumber?.trim()
    );

    // اگر هم ارزیاب شبا دارد و هم تمام کمک‌یارها شبا دارند، هیچ چیز نمایش نده!
    if (!isMyShebaMissing && missingAssistants.length === 0) {
      return null;
    }

    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50/70 rounded-3xl border border-amber-200/90 p-5 sm:p-7 shadow-sm space-y-5 animate-in fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/70 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-amber-950">
                  اقدام لازم: ثبت شماره شبا جهت واریز حق‌الزحمه
                </h3>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                  تسویه حساب
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                جهت واریز حق‌الزحمه ارزیابی‌ها، لطفاً اطلاعات شبای ناقص را تکمیل فرمایید (افرادی که شبای آن‌ها ثبت شده در این لیست نمایش داده نمی‌شوند).
              </p>
            </div>
          </div>

          <Link
            href="/evaluator/timesheets"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-950 bg-white/90 border border-amber-300/80 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-amber-100 transition self-start sm:self-auto"
          >
            <span>ویرایش شماره‌های ثبت‌شده</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-700" />
          </Link>
        </div>

        {/* فیلد ثبت شبای خود ارزیاب (فقط اگر ثبت نکرده باشد) */}
        {isMyShebaMissing && (
          <div className="p-4 bg-white/95 rounded-2xl border border-amber-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-900">
                  شماره شبای شما ({evaluatorName}) - <span className="text-amber-700 font-semibold">هنوز ثبت نشده است</span>
                </span>
              </div>
              {mySaved && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                  ✓ شماره شبا ذخیره شد
                </span>
              )}
              {myError && (
                <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-lg">
                  {myError}
                </span>
              )}
            </div>

            <form onSubmit={handleSaveMySheba} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <input
                type="text"
                value={mySheba}
                onChange={(e) => setMySheba(e.target.value)}
                placeholder="IR..."
                dir="ltr"
                className="w-full font-mono text-xs sm:text-sm bg-slate-50 border border-amber-300 focus:bg-white focus:border-amber-600 rounded-xl px-3 py-2 text-slate-900 outline-none transition"
              />
              <button
                type="submit"
                disabled={myLoading || !mySheba.trim()}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
              >
                {myLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>ثبت شماره شبا</span>
              </button>
            </form>
          </div>
        )}

        {/* فیلدهای ثبت شبای کمک‌ارزیابان ناقص (فقط کمک‌ارزیابانی که شبا ندارند) */}
        {missingAssistants.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
              <Users className="w-3.5 h-3.5 text-amber-700" />
              <span>کمک‌ارزیاب‌های جدید بدون شماره شبا ({missingAssistants.length} نفر):</span>
            </div>

            <div className="space-y-2">
              {missingAssistants.map((asst) => {
                const currentVal = assistantShebas[asst.id] || "";
                const isLoading = assistantLoading === asst.id;
                const isSaved = assistantSaved === asst.id;

                return (
                  <div
                    key={asst.id}
                    className="p-3.5 bg-white/95 rounded-2xl border border-amber-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                        <span>{asst.fullName}</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-semibold">
                          کمک‌ارزیاب
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {asst.phone && <span>تماس: {asst.phone} </span>}
                        {asst.nationalCode && <span>| کدملی: {asst.nationalCode}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSaved && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                          ✓ ذخیره شد
                        </span>
                      )}
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
                        className="w-full sm:w-56 font-mono text-xs bg-slate-50 border border-amber-300 focus:bg-white focus:border-amber-600 rounded-xl px-3 py-1.5 text-slate-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveAssistantSheba(asst.id)}
                        disabled={isLoading || !currentVal.trim()}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        <span>ثبت</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // حالت ۲: Manager (صفحه ثبت فعالیت /evaluator/timesheets)
  // دارای دکمه ویرایش و امکان ویرایش کلیه شماره‌ها
  // ==========================================
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-0">
      {/* سربرگ بخش با دکمه ویرایش / باز و بسته کردن */}
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                اطلاعات حساب و شماره شبا
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                تسویه حساب
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              مشاهده و ویرایش شماره شبای بانکی شما و کمک‌ارزیابان همکار جهت پرداخت حق‌الزحمه
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {collapsible && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isOpen ? "بستن بخش شبا" : "ویرایش شماره‌های شبا"}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-5 sm:p-6 space-y-6 animate-in fade-in">
          {/* ۱. شماره شبای خود ارزیاب */}
          <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/70 space-y-3">
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
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5">
                <div className="flex items-center gap-3 truncate">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-[11px] text-slate-400 block mb-0.5">شماره شبا ثبت‌شده:</span>
                    <span className="font-mono text-xs sm:text-sm md:text-base font-black text-indigo-900 tracking-wider select-all" dir="ltr">
                      {mySheba}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMyEditing(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer shrink-0"
                >
                  <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
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
                      className="w-full font-mono text-xs sm:text-sm bg-white border border-indigo-300 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-slate-900 outline-none transition"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={myLoading}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {myLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>ذخیره شماره شبا</span>
                    </button>
                    {myEditing && mySheba && (
                      <button
                        type="button"
                        onClick={() => {
                          setMyEditing(false);
                          setMySheba(evaluatorSheba || "");
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
                      >
                        انصراف
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  * شماره شبا باید با IR و ۲۴ رقم انگلیسی بدون فاصله وارد شود.
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
              <div className="p-5 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200/60">
                در حال حاضر هیچ کمک‌ارزیابی به شما تخصیص داده نشده است.
              </div>
            ) : (
              <div className="space-y-2.5">
                {assistants.map((asst) => {
                  const currentVal = assistantShebas[asst.id] || "";
                  const isEditing = editingAssistantId === asst.id;
                  const isLoading = assistantLoading === asst.id;
                  const isSaved = assistantSaved === asst.id;

                  return (
                    <div
                      key={asst.id}
                      className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-300 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900">
                            {asst.fullName}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200/60">
                            کمک‌ارزیاب
                          </span>
                          {!currentVal && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200/60">
                              شبا ثبت نشده
                            </span>
                          )}
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
                              type="button"
                              onClick={() => setEditingAssistantId(asst.id)}
                              className="p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                              title="ویرایش شماره شبا"
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
                              type="button"
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
                                type="button"
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
      )}
    </div>
  );
}

