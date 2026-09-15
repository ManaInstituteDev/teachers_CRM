import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { History, ArrowUpRight, GraduationCap, School, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MyEvaluationsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const evaluations = await prisma.teacherEvaluation.findMany({
    where: { evaluatorId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      teacher: { include: { school: true } },
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "KEY_AXIS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            محور
          </span>
        );
      case "DEVELOPMENTAL_RELATION":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            مستعد ارتباط رشدی
          </span>
        );
      case "OCCASIONAL_RELATION":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            ارتباط موردی
          </span>
        );
      case "UNSUITABLE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            نامناسب همکاری
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            در انتظار ارزیابی
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-5xl mx-auto">
      {/* هدر بخش */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            سوابق ارزیابی‌های من
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            مشاهده فرم‌های ثبت‌شده و نتایج ارزیابی‌های شما در سامانه
          </p>
        </div>

        <Link
          href="/evaluator/evaluate"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition"
        >
          <span>ثبت ارزیابی جدید</span>
        </Link>
      </div>

      {/* لیست ارزیابی‌ها */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 text-xs font-semibold">
              <tr>
                <th className="py-3.5 px-6">نام معلم</th>
                <th className="py-3.5 px-6">رشته و مقطع</th>
                <th className="py-3.5 px-6">مدرسه</th>
                <th className="py-3.5 px-6 text-center">نمره موزون کل</th>
                <th className="py-3.5 px-6 text-center">وضعیت همکاری</th>
                <th className="py-3.5 px-6">تاریخ ثبت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evaluations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    هنوز ارزیابی ثبت نکرده‌اید.
                  </td>
                </tr>
              ) : (
                evaluations.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {ev.teacher.firstName} {ev.teacher.lastName}
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-xs">
                      {ev.teacher.subject} ({ev.teacher.grade})
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-xs">
                      {ev.teacher.school?.name || ev.teacher.schoolNameManual || "نامشخص"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center font-bold text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">
                        {ev.totalWeightedScore.toFixed(1)} <span className="text-[10px] text-slate-400 mr-1">/ ۱۰۰</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {getStatusBadge(ev.finalRecommendation)}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(ev.createdAt).toLocaleDateString("fa-IR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
