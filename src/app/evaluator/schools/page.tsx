import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  School as SchoolIcon,
  Search,
  PlusCircle,
  Users,
  UserPlus,
  ArrowUpRight,
  MapPin,
  Building2,
  Phone,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EvaluatorSchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { q } = await searchParams;

  const whereClause: any = {};
  if (q?.trim()) {
    whereClause.OR = [
      { name: { contains: q.trim(), mode: "insensitive" } },
      { code: { contains: q.trim(), mode: "insensitive" } },
      { district: { contains: q.trim(), mode: "insensitive" } },
      { city: { contains: q.trim(), mode: "insensitive" } },
    ];
  }

  const schools = await prisma.school.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      teachers: {
        select: {
          id: true,
          roleTitle: true,
          collaborationStatus: true,
        },
      },
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

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-6xl mx-auto">
      {/* هدر بخش */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <SchoolIcon className="w-7 h-7 text-emerald-600" />
            <span>مدارس و کادر آموزشی</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            مدرسه مورد نظر خود را انتخاب کرده و فرآیند ثبت و ارزیابی کادر (معلمان، مشاوران و معاونان) آن را آغاز کنید.
          </p>
        </div>

        <Link
          href="/evaluator/schools/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>ثبت شناسنامه مدرسه جدید</span>
        </Link>
      </div>

      {/* باکس جستجو */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <form className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="جستجو بر اساس نام مدرسه، منطقه، کد..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl pr-10 pl-3.5 py-2 text-xs sm:text-sm outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition shrink-0 cursor-pointer"
          >
            جستجو
          </button>
        </form>
      </div>

      {/* لیست مدارس به صورت کارت‌های تعاملی مدرسه‌محور */}
      {schools.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <SchoolIcon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">مدرسه‌ای یافت نشد</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            مدرسه‌ای با این مشخصات ثبت نشده است. می‌توانید با دکمه زیر مدرسه جدید را ثبت نمایید.
          </p>
          <Link
            href="/evaluator/schools/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ثبت مدرسه جدید</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schools.map((school) => {
            const teachersCount = school._count.teachers;
            const rolesCount = school.teachers.reduce<Record<string, number>>((acc, t) => {
              const r = t.roleTitle || "معلم";
              acc[r] = (acc[r] || 0) + 1;
              return acc;
            }, {});

            return (
              <div
                key={school.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition flex flex-col justify-between space-y-5"
              >
                {/* مشخصات اصلی مدرسه */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <SchoolIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="font-bold text-base text-slate-900 leading-tight">
                          {school.name}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>
                            {school.province} - {school.district}
                          </span>
                          {school.code && (
                            <span className="font-mono text-[11px] text-slate-400">
                              (کد: {school.code})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 shrink-0">
                      {getOwnershipLabel(school.ownershipType)}
                    </span>
                  </div>

                  {/* آدرس یا نام مدیر */}
                  {(school.principalName || school.phone || school.address) && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 rounded-xl p-2.5 space-y-1">
                      {school.principalName && (
                        <div>
                          <strong>مدیر مدرسه:</strong> {school.principalName}
                          {school.phone && <span className="mr-2 font-mono text-slate-400">({school.phone})</span>}
                        </div>
                      )}
                      {school.address && (
                        <div className="text-slate-400 truncate">
                          نشانی: {school.address}
                        </div>
                      )}
                    </div>
                  )}

                  {/* آمار کادر ارزیابی‌شده */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-sky-600" />
                        <span>کادر ارزیابی‌شده:</span>
                      </span>
                      <span className="font-bold text-slate-900 bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-lg border border-sky-200/60">
                        {teachersCount} نفر
                      </span>
                    </div>

                    {/* ریز نقش‌های کادر */}
                    {teachersCount > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {Object.entries(rolesCount).map(([role, count]) => (
                          <span
                            key={role}
                            className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                          >
                            {count} {role}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* دکمه‌های عملیات مدرسه‌محور */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/evaluator/schools/${school.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition"
                  >
                    <span>مشاهده کادر ({teachersCount})</span>
                  </Link>

                  <Link
                    href={`/evaluator/evaluate?schoolId=${school.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ ثبت کادر جدید این مدرسه</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
