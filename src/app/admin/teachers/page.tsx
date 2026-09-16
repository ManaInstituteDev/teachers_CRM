import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SearchableEvaluatorSelect from "@/components/SearchableEvaluatorSelect";
import { SearchableSchoolSelect } from "@/components/SearchableSchoolSelect";
import { ExportDataButton } from "@/components/admin/ExportDataButton";
import { AxisQualitativeFilter } from "@/components/admin/AxisQualitativeFilter";
import {
  GraduationCap,
  ArrowUpRight,
  Search,
  Filter,
  Award,
  Calendar,
  User,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
  School as SchoolIcon,
  X,
  Briefcase,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface SearchParamsProps {
  q?: string;
  status?: string;
  evaluatorId?: string;
  roleTitle?: string;
  schoolId?: string;
  sortBy?: string;
  sortOrder?: string;
  minScore?: string;
  maxScore?: string;
  minAxis1?: string;
  minAxis2?: string;
  minAxis3?: string;
  minAxis4?: string;
  minAxis5?: string;
  axisFilter?: string;
  qualitativeFilter?: string;
}

export default async function AdminTeachersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsProps>;
}) {
  const params = await searchParams;
  const q = params.q || "";
  const status = params.status || "ALL";
  const evaluatorId = params.evaluatorId || "ALL";
  const roleTitle = params.roleTitle || "ALL";
  const schoolId = params.schoolId || "ALL";
  const sortBy = params.sortBy || "totalScore"; // totalScore, axis1, axis2, axis3, axis4, axis5, teachingYears, createdAt, name
  const sortOrder = params.sortOrder === "asc" ? "asc" : "desc";
  const minScore = params.minScore ? parseFloat(params.minScore) : null;
  const maxScore = params.maxScore ? parseFloat(params.maxScore) : null;

  // فیلترهای تک‌تک محورها
  const minAxis1 = params.minAxis1 ? parseInt(params.minAxis1, 10) : null;
  const minAxis2 = params.minAxis2 ? parseInt(params.minAxis2, 10) : null;
  const minAxis3 = params.minAxis3 ? parseInt(params.minAxis3, 10) : null;
  const minAxis4 = params.minAxis4 ? parseInt(params.minAxis4, 10) : null;
  const minAxis5 = params.minAxis5 ? parseInt(params.minAxis5, 10) : null;

  // فیلتر توصیف کیفی در محور انتخابی
  const axisFilter = params.axisFilter || "";
  const qualitativeFilter = params.qualitativeFilter || "";

  // دریافت لیست ارزیاب‌ها جهت دراپ‌داون فیلتر با پشتیبانی از سرچ
  const evaluators = await prisma.user.findMany({
    where: { role: "EVALUATOR" },
    select: { id: true, fullName: true, username: true },
    orderBy: { fullName: "asc" },
  });

  // دریافت لیست مدارس جهت دراپ‌داون فیلتر با پشتیبانی از سرچ
  const schools = await prisma.school.findMany({
    select: { id: true, name: true, district: true, code: true, city: true },
    orderBy: { name: "asc" },
  });

  // ساخت شرط‌های فیلتر
  const whereClause: any = {};

  if (q.trim()) {
    whereClause.OR = [
      { firstName: { contains: q.trim(), mode: "insensitive" } },
      { lastName: { contains: q.trim(), mode: "insensitive" } },
      { subject: { contains: q.trim(), mode: "insensitive" } },
      { schoolNameManual: { contains: q.trim(), mode: "insensitive" } },
      { phone: { contains: q.trim(), mode: "insensitive" } },
      { nationalCode: { contains: q.trim(), mode: "insensitive" } },
    ];
  }

  if (status && status !== "ALL") {
    whereClause.collaborationStatus = status;
  }

  if (roleTitle && roleTitle !== "ALL") {
    whereClause.roleTitle = roleTitle;
  }

  if (schoolId && schoolId !== "ALL") {
    whereClause.schoolId = schoolId;
  }

  // فیلتر بر اساس ارزیابی‌ها
  const evaluationFilters: any = {};
  if (evaluatorId && evaluatorId !== "ALL") {
    evaluationFilters.evaluatorId = evaluatorId;
  }

  if (minScore !== null || maxScore !== null) {
    evaluationFilters.totalWeightedScore = {};
    if (minScore !== null) evaluationFilters.totalWeightedScore.gte = minScore;
    if (maxScore !== null) evaluationFilters.totalWeightedScore.lte = maxScore;
  }

  if (minAxis1 !== null) evaluationFilters.rawAxis1 = { gte: minAxis1 };
  if (minAxis2 !== null) evaluationFilters.rawAxis2 = { gte: minAxis2 };
  if (minAxis3 !== null) evaluationFilters.rawAxis3 = { gte: minAxis3 };
  if (minAxis4 !== null) evaluationFilters.rawAxis4 = { gte: minAxis4 };
  if (minAxis5 !== null) evaluationFilters.rawAxis5 = { gte: minAxis5 };

  // اعمال فیلتر بر اساس توصیف کیفی در محور انتخاب‌شده
  if (axisFilter && qualitativeFilter) {
    const axisNum = parseInt(axisFilter, 10);
    switch (axisNum) {
      case 1:
        evaluationFilters.qualitativeAxis1 = qualitativeFilter;
        break;
      case 2:
        if (qualitativeFilter === "توانمند در شناسایی و هدایت استعداد") {
          evaluationFilters.qualitativeAxis2 = {
            in: ["توانمند در شناسایی و هدایت استعداد", "توان بسیار بالا در شناسایی استعداد فراتر از نمره"],
          };
        } else if (qualitativeFilter === "دارای ظرفیت مناسب، نیازمند توانمندسازی بیشتر") {
          evaluationFilters.qualitativeAxis2 = {
            in: ["دارای ظرفیت مناسب، نیازمند توانمندسازی بیشتر", "توان مناسب و قابل اتکا در شناسایی استعداد"],
          };
        } else if (qualitativeFilter === "مناسب معرفی موردی دانش‌آموز") {
          evaluationFilters.qualitativeAxis2 = {
            in: ["مناسب معرفی موردی دانش‌آموز", "شناسایی محدود و نیازمند شواهد تکمیلی"],
          };
        } else if (qualitativeFilter === "فاقد توان کافی برای هدایت استعداد") {
          evaluationFilters.qualitativeAxis2 = {
            in: ["فاقد توان کافی برای هدایت استعداد", "فاقد توان تشخیص و شواهد عینی استعداد"],
          };
        } else {
          evaluationFilters.qualitativeAxis2 = qualitativeFilter;
        }
        break;
      case 3:
        evaluationFilters.qualitativeAxis3 = qualitativeFilter;
        break;
      case 4:
        evaluationFilters.qualitativeAxis4 = qualitativeFilter;
        break;
      case 5:
        evaluationFilters.qualitativeAxis5 = qualitativeFilter;
        break;
    }
  }

  if (Object.keys(evaluationFilters).length > 0) {
    whereClause.evaluations = {
      some: evaluationFilters,
    };
  }

  // واکشی معلمان به همراه ارزیابی‌ها
  const rawTeachers = await prisma.teacher.findMany({
    where: whereClause,
    include: {
      school: true,
      evaluations: {
        include: { evaluator: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  // انجام مرتب‌سازی پیشرفته (Sorting)
  const teachers = [...rawTeachers].sort((a, b) => {
    const evalA = a.evaluations[0];
    const evalB = b.evaluations[0];

    let valA: number | string = 0;
    let valB: number | string = 0;

    switch (sortBy) {
      case "totalScore":
        valA = evalA ? evalA.totalWeightedScore : -1;
        valB = evalB ? evalB.totalWeightedScore : -1;
        break;

      case "axis1": // رابطه تربیتی (سقف ۵۰)
        valA = evalA ? evalA.rawAxis1 : -1;
        valB = evalB ? evalB.rawAxis1 : -1;
        break;

      case "axis2": // شناسایی استعداد (سقف ۸۰)
        valA = evalA ? evalA.rawAxis2 : -1;
        valB = evalB ? evalB.rawAxis2 : -1;
        break;

      case "axis3": // نگرش علوم انسانی (سقف ۱۰۰)
        valA = evalA ? evalA.rawAxis3 : -1;
        valB = evalB ? evalB.rawAxis3 : -1;
        break;

      case "axis4": // سرمایه ارتباطی (سقف ۱۰۰)
        valA = evalA ? evalA.rawAxis4 : -1;
        valB = evalB ? evalB.rawAxis4 : -1;
        break;

      case "axis5": // تعهد و همکاری (سقف ۷۵)
        valA = evalA ? evalA.rawAxis5 : -1;
        valB = evalB ? evalB.rawAxis5 : -1;
        break;

      case "teachingYears":
        valA = a.teachingYears;
        valB = b.teachingYears;
        break;

      case "name":
        valA = a.lastName;
        valB = b.lastName;
        return sortOrder === "asc"
          ? (valA as string).localeCompare(valB as string, "fa")
          : (valB as string).localeCompare(valA as string, "fa");

      case "createdAt":
      default:
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
        break;
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "KEY_AXIS":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
            محور
          </span>
        );
      case "DEVELOPMENTAL_RELATION":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            مستعد ارتباط رشدی
          </span>
        );
      case "OCCASIONAL_RELATION":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            ارتباط موردی
          </span>
        );
      case "UNSUITABLE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            نامناسب همکاری
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            در انتظار ارزیابی
          </span>
        );
    }
  };

  // کمکی برای ساخت URL مرتب‌سازی
  const getSortUrl = (field: string) => {
    const isCurrent = sortBy === field;
    const nextOrder = isCurrent && sortOrder === "desc" ? "asc" : "desc";
    const currentParams = new URLSearchParams();
    if (q) currentParams.set("q", q);
    if (status !== "ALL") currentParams.set("status", status);
    if (roleTitle !== "ALL") currentParams.set("roleTitle", roleTitle);
    if (evaluatorId !== "ALL") currentParams.set("evaluatorId", evaluatorId);
    if (schoolId !== "ALL") currentParams.set("schoolId", schoolId);
    if (minScore !== null) currentParams.set("minScore", String(minScore));
    if (maxScore !== null) currentParams.set("maxScore", String(maxScore));
    if (minAxis1 !== null) currentParams.set("minAxis1", String(minAxis1));
    if (minAxis2 !== null) currentParams.set("minAxis2", String(minAxis2));
    if (minAxis3 !== null) currentParams.set("minAxis3", String(minAxis3));
    if (minAxis4 !== null) currentParams.set("minAxis4", String(minAxis4));
    if (minAxis5 !== null) currentParams.set("minAxis5", String(minAxis5));
    if (axisFilter) currentParams.set("axisFilter", axisFilter);
    if (qualitativeFilter) currentParams.set("qualitativeFilter", qualitativeFilter);

    currentParams.set("sortBy", field);
    currentParams.set("sortOrder", nextOrder);
    return `/admin/teachers?${currentParams.toString()}`;
  };

  const renderSortIndicator = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 opacity-60 inline-block mr-1" />;
    }
    return sortOrder === "desc" ? (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600 inline-block mr-1" />
    ) : (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600 inline-block mr-1" />
    );
  };

  const exportRows = teachers.map((t) => {
    const ev = t.evaluations[0];
    const statusLabel =
      t.collaborationStatus === "KEY_AXIS"
        ? "محور"
        : t.collaborationStatus === "DEVELOPMENTAL_RELATION"
        ? "مستعد ارتباط رشدی"
        : t.collaborationStatus === "OCCASIONAL_RELATION"
        ? "ارتباط موردی"
        : t.collaborationStatus === "UNSUITABLE"
        ? "نامناسب همکاری"
        : "در انتظار ارزیابی";

    return [
      t.firstName,
      t.lastName,
      t.roleTitle || "معلم",
      t.nationalCode || "-",
      t.phone || "-",
      t.school ? t.school.name : t.schoolNameManual || "-",
      t.subject || "-",
      t.grade || "-",
      t.teachingYears ?? "-",
      ev ? ev.totalWeightedScore : "-",
      statusLabel,
      ev ? ev.rawAxis1 : "-",
      ev ? ev.rawAxis2 : "-",
      ev ? ev.rawAxis3 : "-",
      ev ? ev.rawAxis4 : "-",
      ev ? ev.rawAxis5 : "-",
      ev && ev.evaluator ? ev.evaluator.fullName : "-",
      ev ? ev.dialogueDurationMin : "-",
      ev ? new Date(ev.createdAt).toLocaleDateString("fa-IR") : "-",
    ];
  });

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6">
      {/* هدر بخش */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            بانک معلمان و کارنامه‌های ارزیابی
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            فیلتر و مرتب‌سازی پیشرفته بر اساس هر یک از محورهای ۵‌گانه، نمرات کل، ارزیاب‌ها و وضعیت همکاری
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
            {teachers.length} نفر یافت شد
          </span>

          <ExportDataButton
            filename="teachers_evaluation_report"
            title="خروجی اطلاعات (اکسل)"
            headers={[
              "نام",
              "نام خانوادگی",
              "نقش در مدرسه",
              "کد ملی",
              "شماره تماس",
              "مدرسه",
              "رشته / درس",
              "مقطع",
              "سابقه تدریس (سال)",
              "نمره کل وزنی (از ۱۰۰)",
              "وضعیت همکاری",
              "محور ۱ (اهداف و اسناد)",
              "محور ۲ (صلاحیت‌ها)",
              "محور ۳ (روش‌های تدریس)",
              "محور ۴ (ابزارها و سنجش)",
              "محور ۵ (انگیزه و هویت)",
              "ارزیاب ثبت‌کننده",
              "مدت مصاحبه (دقیقه)",
              "تاریخ ارزیابی",
            ]}
            rows={exportRows}
          />
        </div>
      </div>

      {/* فرم جستجو و فیلترهای پیشرفته */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <form method="GET" action="/admin/teachers" className="space-y-4">
          {/* ردیف اول: جستجوی متنی و دکمه اعمال */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="جستجو بر اساس نام معلم، رشته تدریس، نام مدرسه، شماره همراه یا کدملی..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-2xl pr-10 pl-3.5 py-2.5 text-xs sm:text-sm outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
              >
                اعمال فیلترها
              </button>

              <Link
                href="/admin/teachers"
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs sm:text-sm font-semibold transition flex items-center gap-1.5"
                title="پاک‌کردن فیلترها"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">بازنشانی</span>
              </Link>
            </div>
          </div>

          {/* ردیف دوم: انتخاب وضعیت، نقش، ارزیاب، مدرسه، مرتب‌سازی و جهت */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100">
            {/* فیلتر وضعیت همکاری */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                وضعیت همکاری:
              </label>
              <select
                name="status"
                defaultValue={status}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
              >
                <option value="ALL">همه وضعیت‌ها</option>
                <option value="KEY_AXIS">محور (بالای ۸۰٪)</option>
                <option value="DEVELOPMENTAL_RELATION">مستعد ارتباط رشدی (۵۰ تا ۸۰٪)</option>
                <option value="OCCASIONAL_RELATION">ارتباط موردی (۳۰ تا ۵۰٪)</option>
                <option value="UNSUITABLE">نامناسب همکاری (زیر ۳۰٪)</option>
                <option value="PENDING_EVALUATION">در انتظار ارزیابی</option>
              </select>
            </div>

            {/* فیلتر نقش فرد در مدرسه */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                نقش فرد در مدرسه:
              </label>
              <select
                name="roleTitle"
                defaultValue={roleTitle}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
              >
                <option value="ALL">همه نقش‌ها</option>
                <option value="معلم">معلم / دبیر / آموزگار</option>
                <option value="مشاور">مشاور مدرسه</option>
                <option value="معاون آموزشی">معاون آموزشی</option>
                <option value="معاون پرورشی">معاون پرورشی</option>
                <option value="معاون اجرایی">معاون اجرایی</option>
                <option value="مدیر مدرسه">مدیر مدرسه</option>
                <option value="مربی تربیتی">مربی تربیتی / فرهنگی</option>
              </select>
            </div>

            {/* فیلتر ارزیاب با قابلیت سرچ در باکس */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                ارزیاب ثبت‌کننده (سرچ‌دار):
              </label>
              <SearchableEvaluatorSelect
                evaluators={evaluators}
                defaultValue={evaluatorId}
                name="evaluatorId"
                placeholder="جستجوی نام یا نام‌کاربری ارزیاب..."
              />
            </div>

            {/* فیلتر مدرسه با قابلیت سرچ در باکس */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                مدرسه (سرچ‌دار):
              </label>
              <SearchableSchoolSelect
                schools={schools}
                defaultValue={schoolId}
                name="schoolId"
                noneValue="ALL"
                noneLabel="همه مدارس"
                placeholder="جستجوی نام یا منطقه مدرسه..."
                buttonClassName="bg-slate-50 border-slate-200 rounded-xl min-h-[36px] py-1.5 text-xs"
              />
            </div>

            {/* مرتب‌سازی بر اساس محورها یا فیلدها */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                مرتب‌سازی بر پایه:
              </label>
              <select
                name="sortBy"
                defaultValue={sortBy}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
              >
                <option value="totalScore">نمره موزون کل (از ۱۰۰)</option>
                <option value="axis1">نمره محور ۱ (رابطه تربیتی - سقف ۵۰)</option>
                <option value="axis2">نمره محور ۲ (شناسایی استعداد - سقف ۸۰)</option>
                <option value="axis3">نمره محور ۳ (نگرش علوم انسانی - سقف ۱۰۰)</option>
                <option value="axis4">نمره محور ۴ (سرمایه ارتباطی - سقف ۱۰۰)</option>
                <option value="axis5">نمره محور ۵ (تعهد و همکاری - سقف ۷۵)</option>
                <option value="teachingYears">سابقه کار / تدریس</option>
                <option value="name">نام خانوادگی</option>
                <option value="createdAt">جدیدترین زمان ثبت</option>
              </select>
            </div>

            {/* جهت مرتب‌سازی */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                جهت مرتب‌سازی:
              </label>
              <select
                name="sortOrder"
                defaultValue={sortOrder}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
              >
                <option value="desc">نزولی (بیشترین به کمترین)</option>
                <option value="asc">صعودی (کمترین به بیشترین)</option>
              </select>
            </div>
          </div>

          {/* ردیف سوم: فیلتر کف نمره در هر یک از محورهای ۵‌گانه */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
              <span>فیلتر کف نمره خام محورها (نمایش معلمان با حداقل این امتیاز):</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
              <div>
                <input
                  type="number"
                  name="minScore"
                  placeholder="حداقل کل موزون"
                  defaultValue={params.minScore || ""}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] outline-none"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="minAxis1"
                  placeholder="حداقل محور ۱ (از ۵۰)"
                  defaultValue={params.minAxis1 || ""}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] outline-none"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="minAxis2"
                  placeholder="حداقل محور ۲ (از ۸۰)"
                  defaultValue={params.minAxis2 || ""}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] outline-none"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="minAxis3"
                  placeholder="حداقل محور ۳ (از ۱۰۰)"
                  defaultValue={params.minAxis3 || ""}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] outline-none"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="minAxis4"
                  placeholder="حداقل محور ۴ (از ۱۰۰)"
                  defaultValue={params.minAxis4 || ""}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] outline-none"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="minAxis5"
                  placeholder="حداقل محور ۵ (از ۷۵)"
                  defaultValue={params.minAxis5 || ""}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] outline-none"
                />
              </div>
            </div>
          </div>

          {/* فیلتر پویا بر اساس توصیف کیفی در محور انتخابی */}
          <AxisQualitativeFilter
            initialAxis={axisFilter}
            initialQualitative={qualitativeFilter}
          />
        </form>

        {/* برچسب‌های فیلترهای سریع وضعیت و فیلتر فعال توصیفی */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400 shrink-0">فیلتر سریع:</span>

          {axisFilter && qualitativeFilter && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>محور {axisFilter}:</span>
              <span className="text-indigo-700">«{qualitativeFilter}»</span>
              <Link
                href={`/admin/teachers?${(() => {
                  const p = new URLSearchParams();
                  if (q) p.set("q", q);
                  if (status !== "ALL") p.set("status", status);
                  if (evaluatorId !== "ALL") p.set("evaluatorId", evaluatorId);
                  if (schoolId !== "ALL") p.set("schoolId", schoolId);
                  if (roleTitle !== "ALL") p.set("roleTitle", roleTitle);
                  if (sortBy) p.set("sortBy", sortBy);
                  if (sortOrder) p.set("sortOrder", sortOrder);
                  return p.toString();
                })()}`}
                className="text-rose-500 hover:text-rose-700 mr-1 p-0.5 rounded hover:bg-rose-100"
                title="حذف فیلتر توصیفی"
              >
                <X className="w-3 h-3" />
              </Link>
            </div>
          )}

          <Link
            href="/admin/teachers"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              status === "ALL" && !axisFilter
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            همه
          </Link>

          <Link
            href="/admin/teachers?status=KEY_AXIS"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              status === "KEY_AXIS"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100"
            }`}
          >
            محور (نخبه)
          </Link>

          <Link
            href="/admin/teachers?status=DEVELOPMENTAL_RELATION"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              status === "DEVELOPMENTAL_RELATION"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            مستعد ارتباط رشدی
          </Link>

          <Link
            href="/admin/teachers?status=OCCASIONAL_RELATION"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              status === "OCCASIONAL_RELATION"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            ارتباط موردی
          </Link>

          <Link
            href="/admin/teachers?status=UNSUITABLE"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              status === "UNSUITABLE"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            نامناسب همکاری
          </Link>
        </div>
      </div>

      {/* جدول معلمان با امکان سورت مستقیم روی ستون‌ها */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 text-xs font-bold">
              <tr>
                <th className="py-4 px-5">
                  <Link href={getSortUrl("name")} className="hover:text-indigo-600 flex items-center">
                    <span>نام و سوابق معلم</span>
                    {renderSortIndicator("name")}
                  </Link>
                </th>
                <th className="py-4 px-5">رشته و مقطع</th>
                <th className="py-4 px-5">مدرسه محل خدمت</th>

                {/* سرستون‌های سورت‌شونده محورها */}
                <th className={`py-4 px-3 text-center ${axisFilter === "1" ? "bg-indigo-100/80 text-indigo-900 ring-1 ring-indigo-400" : ""}`}>
                  <Link href={getSortUrl("axis1")} className="hover:text-indigo-600 inline-flex items-center" title="محور ۱: رابطه تربیتی (سقف ۵۰)">
                    <span>م ۱</span>
                    {renderSortIndicator("axis1")}
                  </Link>
                </th>

                <th className={`py-4 px-3 text-center ${axisFilter === "2" ? "bg-emerald-100/80 text-emerald-900 ring-1 ring-emerald-400" : ""}`}>
                  <Link href={getSortUrl("axis2")} className="hover:text-indigo-600 inline-flex items-center" title="محور ۲: توان شناسایی استعداد (سقف ۸۰)">
                    <span>م ۲</span>
                    {renderSortIndicator("axis2")}
                  </Link>
                </th>

                <th className={`py-4 px-3 text-center ${axisFilter === "3" ? "bg-indigo-100/80 text-indigo-900 ring-1 ring-indigo-400" : ""}`}>
                  <Link href={getSortUrl("axis3")} className="hover:text-indigo-600 inline-flex items-center" title="محور ۳: نگرش علوم انسانی (سقف ۱۰۰)">
                    <span>م ۳</span>
                    {renderSortIndicator("axis3")}
                  </Link>
                </th>

                <th className={`py-4 px-3 text-center ${axisFilter === "4" ? "bg-indigo-100/80 text-indigo-900 ring-1 ring-indigo-400" : ""}`}>
                  <Link href={getSortUrl("axis4")} className="hover:text-indigo-600 inline-flex items-center" title="محور ۴: سرمایه ارتباطی (سقف ۱۰۰)">
                    <span>م ۴</span>
                    {renderSortIndicator("axis4")}
                  </Link>
                </th>

                <th className={`py-4 px-3 text-center ${axisFilter === "5" ? "bg-indigo-100/80 text-indigo-900 ring-1 ring-indigo-400" : ""}`}>
                  <Link href={getSortUrl("axis5")} className="hover:text-indigo-600 inline-flex items-center" title="محور ۵: تعهد و همکاری (سقف ۷۵)">
                    <span>م ۵</span>
                    {renderSortIndicator("axis5")}
                  </Link>
                </th>

                <th className="py-4 px-5 text-center">
                  <Link href={getSortUrl("totalScore")} className="hover:text-indigo-600 inline-flex items-center">
                    <span>نمره موزون کل</span>
                    {renderSortIndicator("totalScore")}
                  </Link>
                </th>

                <th className="py-4 px-5 text-center">وضعیت همکاری</th>
                <th className="py-4 px-5">ارزیاب</th>
                <th className="py-4 px-5 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-16 text-center text-slate-400 text-sm">
                    هیچ معلمی با این فیلترها و شرایط یافت نشد.
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => {
                  const latestEval = teacher.evaluations[0];
                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-5 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{teacher.firstName} {teacher.lastName}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                              teacher.roleTitle === "مشاور"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : teacher.roleTitle?.includes("معاون")
                                ? "bg-sky-50 text-sky-700 border-sky-200"
                                : teacher.roleTitle === "مدیر" || teacher.roleTitle?.includes("مدیر")
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-700 border-slate-200/80"
                            }`}
                          >
                            {teacher.roleTitle || "معلم"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                          سابقه: {teacher.teachingYears} سال
                          {teacher.nationalCode && ` • ${teacher.nationalCode}`}
                        </div>
                      </td>

                      <td className="py-4 px-5 text-slate-600">
                        <div className="font-medium text-xs sm:text-sm">{teacher.subject}</div>
                        <div className="text-[11px] text-slate-400">{teacher.grade}</div>
                      </td>

                      <td className="py-4 px-5 text-slate-600 text-xs">
                        {teacher.school?.name || teacher.schoolNameManual || "نامشخص"}
                      </td>

                      {/* نمرات تفکیکی ۵ محور با نمایش توصیف کیفی */}
                      <td className={`py-4 px-3 text-center whitespace-nowrap ${axisFilter === "1" ? "bg-indigo-50/50" : ""}`}>
                        {latestEval ? (
                          <div>
                            <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md" title={`توصیف: ${latestEval.qualitativeAxis1 || '—'}`}>
                              {latestEval.rawAxis1}
                              <span className="text-[10px] text-slate-400 font-normal">/۵۰</span>
                            </span>
                            {axisFilter === "1" && latestEval.qualitativeAxis1 && (
                              <div className="text-[10px] text-indigo-800 font-semibold mt-1 bg-indigo-100/60 px-1.5 py-0.5 rounded max-w-[130px] mx-auto truncate" title={latestEval.qualitativeAxis1}>
                                {latestEval.qualitativeAxis1}
                              </div>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className={`py-4 px-3 text-center whitespace-nowrap ${axisFilter === "2" ? "bg-emerald-50/50" : ""}`}>
                        {latestEval ? (
                          <div>
                            <span className="font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md" title={`توصیف: ${latestEval.qualitativeAxis2 || '—'}`}>
                              {latestEval.rawAxis2}
                              <span className="text-[10px] text-slate-400 font-normal">/۸۰</span>
                            </span>
                            {(axisFilter === "2" || qualitativeFilter) && latestEval.qualitativeAxis2 && (
                              <div className="text-[10px] text-emerald-800 font-semibold mt-1 bg-emerald-100/70 px-1.5 py-0.5 rounded max-w-[150px] mx-auto truncate" title={latestEval.qualitativeAxis2}>
                                {latestEval.qualitativeAxis2}
                              </div>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className={`py-4 px-3 text-center whitespace-nowrap ${axisFilter === "3" ? "bg-amber-50/50" : ""}`}>
                        {latestEval ? (
                          <div>
                            <span className="font-bold text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md" title={`توصیف: ${latestEval.qualitativeAxis3 || '—'}`}>
                              {latestEval.rawAxis3}
                              <span className="text-[10px] text-slate-400 font-normal">/۱۰۰</span>
                            </span>
                            {axisFilter === "3" && latestEval.qualitativeAxis3 && (
                              <div className="text-[10px] text-amber-800 font-semibold mt-1 bg-amber-100/60 px-1.5 py-0.5 rounded max-w-[130px] mx-auto truncate" title={latestEval.qualitativeAxis3}>
                                {latestEval.qualitativeAxis3}
                              </div>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className={`py-4 px-3 text-center whitespace-nowrap ${axisFilter === "4" ? "bg-sky-50/50" : ""}`}>
                        {latestEval ? (
                          <div>
                            <span className="font-bold text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md" title={`توصیف: ${latestEval.qualitativeAxis4 || '—'}`}>
                              {latestEval.rawAxis4}
                              <span className="text-[10px] text-slate-400 font-normal">/۱۰۰</span>
                            </span>
                            {axisFilter === "4" && latestEval.qualitativeAxis4 && (
                              <div className="text-[10px] text-sky-800 font-semibold mt-1 bg-sky-100/60 px-1.5 py-0.5 rounded max-w-[130px] mx-auto truncate" title={latestEval.qualitativeAxis4}>
                                {latestEval.qualitativeAxis4}
                              </div>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className={`py-4 px-3 text-center whitespace-nowrap ${axisFilter === "5" ? "bg-rose-50/50" : ""}`}>
                        {latestEval ? (
                          <div>
                            <span className="font-bold text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md" title={`توصیف: ${latestEval.qualitativeAxis5 || '—'}`}>
                              {latestEval.rawAxis5}
                              <span className="text-[10px] text-slate-400 font-normal">/۷۵</span>
                            </span>
                            {axisFilter === "5" && latestEval.qualitativeAxis5 && (
                              <div className="text-[10px] text-rose-800 font-semibold mt-1 bg-rose-100/60 px-1.5 py-0.5 rounded max-w-[130px] mx-auto truncate" title={latestEval.qualitativeAxis5}>
                                {latestEval.qualitativeAxis5}
                              </div>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* نمره کل موزون */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        {latestEval ? (
                          <span className="inline-flex items-center justify-center font-black text-sm text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-3 py-1 rounded-xl">
                            {latestEval.totalWeightedScore.toFixed(1)}
                            <span className="text-[10px] text-slate-400 mr-1">/ ۱۰۰</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      {/* وضعیت همکاری */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        {getStatusBadge(teacher.collaborationStatus)}
                      </td>

                      {/* ارزیاب */}
                      <td className="py-4 px-5 text-xs text-slate-600 whitespace-nowrap">
                        {latestEval?.evaluator?.fullName || "—"}
                      </td>

                      {/* دکمه کارنامه کامل */}
                      <td className="py-4 px-5 text-left whitespace-nowrap">
                        <Link
                          href={`/admin/teachers/${teacher.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold transition"
                        >
                          <span>مشاهده کارنامه</span>
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
