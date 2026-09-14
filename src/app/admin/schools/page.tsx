import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { School, ArrowUpRight, Search, MapPin, Building2, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const whereClause: any = {};
  if (q) {
    whereClause.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { code: { contains: q, mode: "insensitive" } },
      { district: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }

  const schools = await prisma.school.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: true,
      _count: {
        select: { teachers: true },
      },
    },
  });

  const getOwnershipLabel = (type: string) => {
    switch (type) {
      case "GOVERNMENTAL":
        return "دولتی";
      case "NON_GOVERNMENTAL":
        return "غیردولتی";
      case "BOARD_OF_TRUSTEES":
        return "هیئت‌امنایی";
      case "NEMOONE_DOLATI":
        return "نمونه دولتی";
      case "SAMPAD":
        return "استعدادهای درخشان (سمپاد)";
      case "SHAHED":
        return "شاهد";
      case "VOCATIONAL":
        return "هنرستان";
      default:
        return "سایر / خاص";
    }
  };

  const getApproachLabel = (approach: string) => {
    switch (approach) {
      case "EDUCATIONAL_GRADE_ORIENTED":
        return "آموزشی و نمره‌محور";
      case "EDUCATIONAL_CULTURAL":
        return "تربیتی و فرهنگی";
      case "SKILL_ORIENTED":
        return "مهارت‌محور";
      case "RESEARCH_ORIENTED":
        return "پژوهش‌محور";
      case "PROBLEM_ORIENTED":
        return "مسئله‌محور";
      case "RELIGIOUS_VALUE":
        return "دینی و ارزشی";
      case "ARTISTIC_CREATIVE":
        return "هنری و خلاق";
      case "ENTREPRENEURSHIP":
        return "کارآفرینی";
      default:
        return "ترکیبی";
    }
  };

  const getAttitudeLabel = (att: string | null) => {
    switch (att) {
      case "POSITIVE_SERIOUS":
        return <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold text-xs">مثبت و جدی</span>;
      case "POSITIVE_LOW_INFO":
        return <span className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md font-semibold text-xs">مثبت اما کم‌اطلاع</span>;
      case "NEUTRAL":
        return <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold text-xs">خنثی</span>;
      case "WEAK_STEREOTYPICAL":
        return <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-semibold text-xs">ضعیف یا کلیشه‌ای</span>;
      default:
        return <span className="text-slate-400 text-xs">—</span>;
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* هدر بخش */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            بانک شناسنامه و ظرفیت مدارس
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            مشاهده توصیف ساختاری، رویکرد غالب تربیتی و ظرفیت علوم انسانی مدارس ثبت‌شده
          </p>
        </div>
      </div>

      {/* جستجو */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <form className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="جستجو بر اساس نام مدرسه، کد مدرسه یا منطقه..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-xl pr-10 pl-3.5 py-2 text-xs md:text-sm outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-semibold transition shrink-0 cursor-pointer"
          >
            جستجو
          </button>
        </form>
      </div>

      {/* جدول مدارس */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 text-xs font-semibold">
              <tr>
                <th className="py-3.5 px-6">نام مدرسه</th>
                <th className="py-3.5 px-6">منطقه / شهر</th>
                <th className="py-3.5 px-6">نوع مالکیت</th>
                <th className="py-3.5 px-6">رویکرد غالب تربیتی</th>
                <th className="py-3.5 px-6">نگرش به علوم انسانی</th>
                <th className="py-3.5 px-6 text-center">معلمان ثبت‌شده</th>
                <th className="py-3.5 px-6 text-left">شناسنامه</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    هیچ مدرسه‌ای یافت نشد.
                  </td>
                </tr>
              ) : (
                schools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {school.name}
                      {school.code && (
                        <div className="text-[11px] font-mono text-slate-400 font-normal">
                          کد: {school.code}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-xs">
                      {school.province} - {school.district}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-700">
                      {getOwnershipLabel(school.ownershipType)}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-700">
                      {getApproachLabel(school.dominantApproach)}
                    </td>
                    <td className="py-4 px-6">
                      {getAttitudeLabel(school.humanitiesAttitude)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {school._count.teachers} معلم
                      </span>
                    </td>
                    <td className="py-4 px-6 text-left">
                      <Link
                        href={`/admin/schools/${school.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition"
                      >
                        <span>مشاهده شناسنامه</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
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
