"use client";

import { useState } from "react";
import { assignSchoolEvaluatorAction } from "@/app/actions/school";
import { UserCheck, Check, Loader2 } from "lucide-react";

interface EvaluatorOption {
  id: string;
  fullName: string;
  username: string;
}

export function AssignEvaluatorForm({
  schoolId,
  currentEvaluatorId,
  evaluators,
}: {
  schoolId: string;
  currentEvaluatorId?: string | null;
  evaluators: EvaluatorOption[];
}) {
  const [selectedId, setSelectedId] = useState(currentEvaluatorId || "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssign = async (evaluatorId: string) => {
    setSelectedId(evaluatorId);
    setLoading(true);
    setError(null);
    setSaved(false);

    const res = await assignSchoolEvaluatorAction(schoolId, evaluatorId || null);
    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          value={selectedId}
          disabled={loading}
          onChange={(e) => handleAssign(e.target.value)}
          className="bg-white border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none transition cursor-pointer min-w-[170px]"
        >
          <option value="">-- بدون ارزیاب متصل --</option>
          {evaluators.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.fullName}
            </option>
          ))}
        </select>
      </div>
      {loading && <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />}
      {saved && (
        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 shrink-0 animate-in fade-in">
          <Check className="w-3.5 h-3.5" /> ثبت شد
        </span>
      )}
      {error && <span className="text-[11px] font-bold text-rose-600 shrink-0">{error}</span>}
    </div>
  );
}
