"use client";

import { useState } from "react";
import { assignSchoolEvaluatorAction } from "@/app/actions/school";
import { Check, Loader2 } from "lucide-react";
import SearchableEvaluatorSelect, { EvaluatorOption } from "@/components/SearchableEvaluatorSelect";
import { CopyableSheba } from "@/components/admin/CopyableSheba";

export function AssignEvaluatorForm({
  schoolId,
  currentEvaluatorId,
  evaluators,
  showSheba = true,
}: {
  schoolId: string;
  currentEvaluatorId?: string | null;
  evaluators: EvaluatorOption[];
  showSheba?: boolean;
}) {
  const [selectedId, setSelectedId] = useState(currentEvaluatorId || "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssign = async (evaluatorId: string) => {
    const cleanId = evaluatorId === "ALL" ? "" : evaluatorId;
    setSelectedId(cleanId);
    setLoading(true);
    setError(null);
    setSaved(false);

    const res = await assignSchoolEvaluatorAction(schoolId, cleanId || null);
    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const selectedEvaluator = evaluators.find((ev) => ev.id === selectedId);

  return (
    <div className="flex flex-col gap-1.5 min-w-50">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-47.5">
          <SearchableEvaluatorSelect
            evaluators={evaluators}
            value={selectedId}
            onChange={handleAssign}
            noneValue=""
            noneLabel="-- بدون ارزیاب متصل --"
            placeholder="جستجوی نام یا نام‌کاربری ارزیاب..."
            buttonClassName="bg-white border-slate-300 hover:border-emerald-400 focus:border-emerald-500 rounded-xl"
            disabled={loading}
          />
        </div>
        {loading && <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />}
        {saved && (
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 shrink-0 animate-in fade-in">
            <Check className="w-3.5 h-3.5" /> ثبت شد
          </span>
        )}
        {error && <span className="text-[11px] font-bold text-rose-600 shrink-0">{error}</span>}
      </div>

      {showSheba && selectedEvaluator && (
        <div className="flex items-center gap-1.5 pt-0.5 animate-in fade-in">
          <CopyableSheba
            shebaNumber={selectedEvaluator.shebaNumber}
            evaluatorId={selectedEvaluator.id}
            evaluatorName={selectedEvaluator.fullName}
            variant="compact"
          />
        </div>
      )}
    </div>
  );
}
