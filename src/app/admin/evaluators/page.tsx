import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserPlus, UserCheck, UserX, Phone, Calendar, ClipboardCheck, Users, Clock, ArrowUpRight } from "lucide-react";
import { toggleEvaluatorStatusAction } from "@/app/actions/evaluator";

export const dynamic = "force-dynamic";

export default async function EvaluatorsListPage() {
  const evaluators = await prisma.user.findMany({
    where: { role: "EVALUATOR" },
    orderBy: { createdAt: "desc" },
    include: {
      assistants: {
        where: { isActive: true },
        orderBy: { fullName: "asc" },
      },
      timesheets: {
        select: { durationMinutes: true, workerType: true },
      },
      _count: {
        select: {
          teacherEvaluations: true,
          createdSchools: true,
        },
      },
    },
  });

  const totalAssistants = await prisma.assistantEvaluator.count();

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6">
      {/* هدر بخش */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            مدیریت ارزیاب‌ها و تیم‌های ارزیابی
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تعریف ارزیاب‌های اصلی، اتصال کمک‌ارزیاب‌ها به ارزیاب و پایش عملکرد تیم‌ها
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/evaluators/assistants"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-sm transition"
          >
            <Users className="w-4 h-4 text-sky-600" />
            <span>مدیریت کمک‌ارزیاب‌ها ({totalAssistants})</span>
          </Link>

          <Link
            href="/admin/evaluators/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>تعریف ارزیاب جدید</span>
          </Link>
        </div>
      </div>

      {/* جدول ارزیاب‌ها */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 text-xs font-bold">
              <tr>
                <th className="py-4 px-6">نام ارزیاب</th>
                <th className="py-4 px-6">نام کاربری</th>
                <th className="py-4 px-6">شماره همراه</th>
                <th className="py-4 px-6">کمک‌ارزیاب‌های متصل</th>
                <th className="py-4 px-6 text-center">ساعات کارکرد</th>
                <th className="py-4 px-6 text-center">ارزیابی‌های ثبت‌شده</th>
                <th className="py-4 px-6 text-center">وضعیت دسترسی</th>
                <th className="py-4 px-6 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evaluators.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 text-sm">
                    هیچ ارزیابی تعریف نشده است. از دکمه «تعریف ارزیاب جدید» استفاده کنید.
                  </td>
                </tr>
              ) : (
                evaluators.map((ev) => {
                  const totalMinutes = ev.timesheets.reduce((acc, curr) => acc + curr.durationMinutes, 0);
                  const totalHours = (totalMinutes / 60).toFixed(1);

                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {ev.fullName}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-600">
                        {ev.username}
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                        {ev.phone || "—"}
                      </td>
                      <td className="py-4 px-6">
                        {ev.assistants.length === 0 ? (
                          <span className="text-xs text-slate-400">فاقد کمک‌ارزیاب</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {ev.assistants.map((ast) => (
                              <span
                                key={ast.id}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/60 px-2 py-0.5 rounded-lg"
                              >
                                <span className="w-1 h-1 rounded-full bg-sky-500"></span>
                                {ast.fullName}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-bold text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl">
                          <Clock className="w-3 h-3 text-purple-500" />
                          {totalHours} ساعت
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                          {ev._count.teacherEvaluations} فرم
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {ev.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            فعال
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            غیرفعال
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-left whitespace-nowrap">
                        <form action={toggleEvaluatorStatusAction.bind(null, ev.id)}>
                          <button
                            type="submit"
                            className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition cursor-pointer ${
                              ev.isActive
                                ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                                : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            {ev.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
