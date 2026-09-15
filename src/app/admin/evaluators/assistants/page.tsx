import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  UserPlus,
  ArrowRight,
  UserCheck,
  Clock,
  Trash2,
  ShieldAlert,
  Calendar,
  Phone,
  CheckCircle2,
} from "lucide-react";
import AssistantFormClient from "./AssistantFormClient";
import { toggleAssistantEvaluatorStatusAction, deleteAssistantEvaluatorAction } from "@/app/actions/assistantEvaluator";

export const dynamic = "force-dynamic";

export default async function AdminAssistantsPage() {
  const [assistants, evaluators] = await Promise.all([
    prisma.assistantEvaluator.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        evaluator: true,
        timesheets: {
          select: { durationMinutes: true },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: "EVALUATOR", isActive: true },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl mx-auto">
      {/* هدر بخش */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/evaluators"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition mb-2"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>بازگشت به مدیریت ارزیاب‌ها</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            مدیریت کمک‌ارزیاب‌ها و اتصال به ارزیاب
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تعریف کمک‌ارزیاب‌ها و لینک کردن آن‌ها به ارزیاب‌های مسئول سامانه
          </p>
        </div>
      </div>

      {/* بنر توضیحی مهم */}
      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong>توجه درباره دسترسی کمک‌ارزیاب:</strong> طبق مصوبه و قوانین سامانه، کمک‌ارزیاب‌ها پنل ورود مستقیم ندارند. آن‌ها به عنوان اعضای تیم اجرایی به یک ارزیاب متصل می‌شوند. ساعت کاری کمک‌ارزیاب‌ها توسط ارزیاب مسئول ثبت می‌شود و گزارش تجمیعی آن‌ها در پنل مدیریت قابل مشاهده است.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ستون فرم افزودن کمک‌ارزیاب جدید */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-base text-slate-900">تعریف و لینک کمک‌ارزیاب جدید</h2>
          </div>

          <AssistantFormClient evaluators={evaluators} />
        </div>

        {/* ستون جدول لیست کمک‌ارزیاب‌ها */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900">کمک‌ارزیاب‌های ثبت‌شده در سامانه</h2>
            <span className="text-xs text-slate-500">{assistants.length} نفر</span>
          </div>

          {assistants.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              هنوز هیچ کمک‌ارزیابی ثبت نشده است. از فرم مقابل برای افزودن کمک‌ارزیاب استفاده کنید.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 text-xs font-bold">
                  <tr>
                    <th className="py-3.5 px-5">نام کمک‌ارزیاب</th>
                    <th className="py-3.5 px-5">ارزیاب متصل</th>
                    <th className="py-3.5 px-5 text-center">ساعات کارکرد</th>
                    <th className="py-3.5 px-5 text-center">وضعیت</th>
                    <th className="py-3.5 px-5 text-left">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assistants.map((ast) => {
                    const totalMins = ast.timesheets.reduce((acc, curr) => acc + curr.durationMinutes, 0);
                    const totalHours = (totalMins / 60).toFixed(1);

                    return (
                      <tr key={ast.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-900">{ast.fullName}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {ast.phone || "بدون شماره"} {ast.nationalCode && `• کدملی: ${ast.nationalCode}`}
                          </div>
                          {ast.notes && (
                            <p className="text-[11px] text-slate-500 mt-1 max-w-xs truncate">
                              {ast.notes}
                            </p>
                          )}
                        </td>

                        <td className="py-4 px-5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{ast.evaluator.fullName}</span>
                          </span>
                        </td>

                        <td className="py-4 px-5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl">
                            <Clock className="w-3 h-3 text-purple-500" />
                            <span>{totalHours} ساعت</span>
                          </span>
                        </td>

                        <td className="py-4 px-5 text-center whitespace-nowrap">
                          {ast.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              فعال
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              غیرفعال
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-5 text-left whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <form action={toggleAssistantEvaluatorStatusAction.bind(null, ast.id)}>
                              <button
                                type="submit"
                                className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition cursor-pointer ${
                                  ast.isActive
                                    ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                                    : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                }`}
                              >
                                {ast.isActive ? "غیرفعال" : "فعال"}
                              </button>
                            </form>

                            <form action={deleteAssistantEvaluatorAction.bind(null, ast.id)}>
                              <button
                                type="submit"
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="حذف کمک‌ارزیاب"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </form>
                          </div>
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
