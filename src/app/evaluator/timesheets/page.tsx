import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  PlusCircle,
  Calendar,
  UserCheck,
  Users,
  School,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import TimesheetFormClient from "./TimesheetFormClient";
import { deleteTimesheetAction } from "@/app/actions/timesheet";

export const dynamic = "force-dynamic";

export default async function EvaluatorTimesheetsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // دریافت کمک‌ارزیاب‌های متصل به این ارزیاب
  const assistants = await prisma.assistantEvaluator.findMany({
    where: { evaluatorId: user.id, isActive: true },
    orderBy: { fullName: "asc" },
  });

  // دریافت لیست مدارس
  const schools = await prisma.school.findMany({
    select: { id: true, name: true, district: true },
    orderBy: { name: "asc" },
  });

  // دریافت لاگ‌های ساعت کاری ثبت شده توسط این ارزیاب
  const logs = await prisma.timesheetLog.findMany({
    where: { evaluatorId: user.id },
    orderBy: { date: "desc" },
    include: {
      assistantEvaluator: true,
      school: true,
    },
  });

  // محاسبات مجموع ساعات
  const totalMinutesSelf = logs
    .filter((l) => l.workerType === "EVALUATOR")
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  const totalMinutesAssistants = logs
    .filter((l) => l.workerType === "ASSISTANT_EVALUATOR")
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  const totalHoursSelf = (totalMinutesSelf / 60).toFixed(1);
  const totalHoursAssistants = (totalMinutesAssistants / 60).toFixed(1);
  const totalHoursAll = ((totalMinutesSelf + totalMinutesAssistants) / 60).toFixed(1);

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 max-w-6xl mx-auto">
      {/* هدر بخش */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/evaluator"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition mb-2"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>بازگشت به داشبورد ارزیاب</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            ثبت و مدیریت ساعات کاری
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ثبت زمان‌های صرف‌شده برای ارزیابی‌ها، جلسات مصاحبه و فعالیت‌های کمک‌ارزیاب‌های همکار
          </p>
        </div>
      </div>

      {/* کارت‌های خلاصه ساعت کارکرد */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">مجموع ساعات کل (تیم)</p>
            <h3 className="text-2xl font-black text-slate-900">{totalHoursAll} <span className="text-xs font-normal text-slate-500">ساعت</span></h3>
            <p className="text-[11px] text-indigo-600 font-medium mt-1">{logs.length} رکورد ثبت‌شده</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">ساعات کاری شخص ارزیاب</p>
            <h3 className="text-2xl font-black text-slate-900">{totalHoursSelf} <span className="text-xs font-normal text-slate-500">ساعت</span></h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">مصاحبه و سنجش معلمان</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">ساعات کاری کمک‌ارزیاب‌ها</p>
            <h3 className="text-2xl font-black text-slate-900">{totalHoursAssistants} <span className="text-xs font-normal text-slate-500">ساعت</span></h3>
            <p className="text-[11px] text-sky-600 font-medium mt-1">{assistants.length} کمک‌ارزیاب متصل</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* فرم ثبت کارکرد جدید */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <PlusCircle className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-base text-slate-900">ثبت ساعت کاری جدید</h2>
          </div>

          <TimesheetFormClient assistants={assistants} schools={schools} />
        </div>

        {/* لیست سوابق ثبت‌شده */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900">سوابق کارکرد ثبت‌شده</h2>
            <span className="text-xs text-slate-500">{logs.length} مورد</span>
          </div>

          {logs.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              هنوز ساعت کاری ثبت نشده است. با استفاده از فرم مقابل کارکرد خود یا کمک‌ارزیاب را ثبت کنید.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 text-xs font-semibold">
                  <tr>
                    <th className="py-3 px-5">تاریخ</th>
                    <th className="py-3 px-5">نیروی کار</th>
                    <th className="py-3 px-5 text-center">مدت زمان</th>
                    <th className="py-3 px-5">شرح فعالیت / مدرسه</th>
                    <th className="py-3 px-5 text-left">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => {
                    const hours = Math.floor(log.durationMinutes / 60);
                    const mins = log.durationMinutes % 60;
                    const dateFormatted = new Date(log.date).toLocaleDateString("fa-IR");

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-5 font-medium text-slate-600 whitespace-nowrap">
                          {dateFormatted}
                        </td>
                        <td className="py-3.5 px-5">
                          {log.workerType === "EVALUATOR" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                              خودم (ارزیاب)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                              کمک‌ارزیاب: {log.assistantEvaluator?.fullName || "نامشخص"}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-center font-bold text-slate-800 whitespace-nowrap">
                          {hours > 0 && `${hours} ساعت `}
                          {mins > 0 && `${mins} دقیقه`}
                          {hours === 0 && mins === 0 && "۰ دقیقه"}
                        </td>
                        <td className="py-3.5 px-5 text-slate-600">
                          <p className="line-clamp-2">{log.description || "—"}</p>
                          {log.school && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                              <School className="w-3 h-3" />
                              {log.school.name}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-left">
                          <form action={deleteTimesheetAction.bind(null, log.id)}>
                            <button
                              type="submit"
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                              title="حذف رکورد"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
