"use client";

import { useState } from "react";
import {
  batchApproveEvaluatorTimesheetsAction,
  batchApproveAssistantTimesheetsAction,
} from "@/app/actions/timesheetApproval";
import { CheckCheck, Loader2 } from "lucide-react";

export function BatchApproveButton({
  evaluatorId,
  personId,
  targetType = "USER",
  pendingCount,
}: {
  evaluatorId?: string;
  personId?: string;
  targetType?: "USER" | "ASSISTANT";
  pendingCount: number;
}) {
  const [loading, setLoading] = useState(false);

  const effectiveId = personId || evaluatorId;
  if (pendingCount === 0 || !effectiveId) return null;

  const handleBatchApprove = async () => {
    if (!confirm(`آیا از تایید هم‌زمان ${pendingCount} مورد ساعت کارکرد در انتظار مطمئن هستید؟`)) {
      return;
    }
    setLoading(true);
    if (targetType === "ASSISTANT") {
      await batchApproveAssistantTimesheetsAction(effectiveId);
    } else {
      await batchApproveEvaluatorTimesheetsAction(effectiveId);
    }
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleBatchApprove}
      disabled={loading}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition cursor-pointer"
      title="تایید یکجای ساعات در انتظار"
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <CheckCheck className="w-3 h-3 text-amber-600" />
      )}
      <span>تایید {pendingCount} لاگ</span>
    </button>
  );
}
