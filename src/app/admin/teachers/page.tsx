import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { GraduationCap, ArrowUpRight, Search, Filter, Award, Calendar, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminTeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const whereClause: any = {};

  if (q) {
    whereClause.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { subject: { contains: q, mode: "insensitive" } },
      { schoolNameManual: { contains: q, mode: "insensitive" } },
    ];
  }

  if (status && status !== "ALL") {
    whereClause.collaborationStatus = status;
  }

  const teachers = await prisma.teacher.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      school: true,
      evaluations: {
        include: { evaluator: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
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
    <div className="p-6 md:p-10 space-y-6">
      {/* هدر بخش */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            بانک معلمان و کارنامه‌های ارزیابی
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            مشاهده رتبه، نمرات تفکیکی ۵ محوره و شایستگی شبکه‌ای معلمان ثبت‌شده توسط ارزیاب‌ها
          </p>
        </div>
      </div>

      {/* فیلترها و جستجو */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <form className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="جستجو بر اساس نام معلم، درس تدریسی یا مدرسه..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-xl pr-10 pl-3.5 py-2 text-xs md:text-sm outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-semibold transition shrink-0 cursor-pointer"
          >
            اعمال فیلتر
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Link
            href="/admin/teachers"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
              !status || status === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            همه
          </Link>
          <Link
            href="/admin/teachers?status=DEVELOPMENTAL_RELATION"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
              status === "DEVELOPMENTAL_RELATION"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            مستعد ارتباط رشدی
          </Link>
          <Link
            href="/admin/teachers?status=OCCASIONAL_RELATION"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
              status === "OCCASIONAL_RELATION"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            ارتباط موردی
          </Link>
          <Link
            href="/admin/teachers?status=UNSUITABLE"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
              status === "UNSUITABLE"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            نامناسب همکاری
          </Link>
        </div>
      </div>

      {/* جدول معلمان */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 text-xs font-semibold">
              <tr>
                <th className="py-3.5 px-6">نام معلم</th>
                <th className="py-3.5 px-6">رشته و مقطع تدریس</th>
                <th className="py-3.5 px-6">مدرسه محل خدمت</th>
                <th className="py-3.5 px-6 text-center">امتیاز موزون کل</th>
                <th className="py-3.5 px-6 text-center">وضعیت همکاری</th>
                <th className="py-3.5 px-6">ارزیاب ثبت‌کننده</th>
                <th className="py-3.5 px-6 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    هیچ معلمی با این شرایط یافت نشد.
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => {
                  const latestEval = teacher.evaluations[0];
                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {teacher.firstName} {teacher.lastName}
                        <div className="text-[11px] text-slate-400 font-normal">
                          سابقه: {teacher.teachingYears} سال
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <div>{teacher.subject}</div>
                        <div className="text-[11px] text-slate-400">{teacher.grade}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {teacher.school?.name || teacher.schoolNameManual || "نامشخص"}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {latestEval ? (
                          <span className="inline-flex items-center justify-center font-bold text-sm text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl">
                            {latestEval.totalWeightedScore.toFixed(1)} <span className="text-[10px] text-slate-400 mr-1">/ ۱۰۰</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {getStatusBadge(teacher.collaborationStatus)}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">
                        {latestEval?.evaluator?.fullName || "—"}
                      </td>
                      <td className="py-4 px-6 text-left">
                        <Link
                          href={`/admin/teachers/${teacher.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition"
                        >
                          <span>کارنامه کامل</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
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
