import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import EvaluatorsTableClient from "./EvaluatorsTableClient";

export const dynamic = "force-dynamic";

export default async function EvaluatorsListPage() {
  const evaluators = await prisma.user.findMany({
    where: { role: "EVALUATOR" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          teacherEvaluations: true,
          createdSchools: true,
        },
      },
    },
  });

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* هدر بخش */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            مدیریت ارزیاب‌های سامانه
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            تعریف دستی ارزیاب‌ها، ارسال دستی اطلاعات ورود با پیامک و کنترل وضعیت دسترسی
          </p>
        </div>

        <Link
          href="/admin/evaluators/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>تعریف ارزیاب جدید</span>
        </Link>
      </div>

      {/* جدول تعاملی ارزیاب‌ها به همراه امکان کپی سریع پیامک */}
      <EvaluatorsTableClient evaluators={evaluators} />
    </div>
  );
}
