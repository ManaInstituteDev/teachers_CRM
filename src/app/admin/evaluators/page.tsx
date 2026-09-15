import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserPlus, Users } from "lucide-react";
import EvaluatorsTableClient from "./EvaluatorsTableClient";
import { ExportDataButton } from "@/components/admin/ExportDataButton";

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

  const evaluatorExportRows = evaluators.map((ev) => {
    const totalMinutes = ev.timesheets.reduce((acc, t) => acc + t.durationMinutes, 0);
    const assistantsNames = ev.assistants.map((a) => a.fullName).join("، ") || "ندارد";

    return [
      ev.fullName,
      ev.username,
      ev.phone || "-",
      ev.assistants.length,
      assistantsNames,
      ev._count.teacherEvaluations,
      (totalMinutes / 60).toFixed(1),
      ev.isActive ? "فعال" : "غیرفعال",
    ];
  });

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6">
      {/* هدر بخش */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            مدیریت ارزیاب‌ها و تیم‌های ارزیابی
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تعریف ارزیاب‌های اصلی، اتصال کمک‌ارزیاب‌ها، ارسال اطلاعات ورود با پیامک و پایش ساعات کاری
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <ExportDataButton
            filename="evaluators_list_report"
            title="خروجی اکسل ارزیابان"
            headers={[
              "نام و نام خانوادگی",
              "نام کاربری",
              "شماره تماس",
              "تعداد کمکیاران",
              "اسامی کمکیاران متصل",
              "تعداد ارزیابی‌های ثبت‌شده",
              "مجموع ساعت کارکرد",
              "وضعیت",
            ]}
            rows={evaluatorExportRows}
          />

          <Link
            href="/admin/evaluators/assistants"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-sm transition"
          >
            <Users className="w-4 h-4 text-sky-600" />
            <span>کمک‌ارزیاب‌ها ({totalAssistants})</span>
          </Link>

          <Link
            href="/admin/evaluators/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>تعریف ارزیاب جدید</span>
          </Link>
        </div>
      </div>

      {/* جدول تعاملی ارزیاب‌ها به همراه امکان کپی سریع پیامک، چیپ‌های کمکیاران و ساعات کاری */}
      <EvaluatorsTableClient evaluators={evaluators} />
    </div>
  );
}
