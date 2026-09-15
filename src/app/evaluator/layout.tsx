import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import {
  LayoutDashboard,
  ClipboardPenLine,
  School,
  History,
  LogOut,
  UserCheck,
  PlusCircle,
  Clock,
} from "lucide-react";
import { EvaluatorNavbar } from "@/components/evaluator/EvaluatorNavbar";
import { EvaluatorBottomNav } from "@/components/evaluator/EvaluatorBottomNav";

export default async function EvaluatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      {/* نوبار بالای صفحه (قابل مشاهده در موبایل و دسکتاپ) */}
      <EvaluatorNavbar userName={user.fullName} phone={user.phone} />

      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        {/* سایدبار ارزیاب در دسکتاپ (در موبایل پنهان است تا فضای گوشی آزاد باشد) */}
        <aside className="hidden md:flex md:w-64 bg-slate-900 text-slate-200 flex-col justify-between shrink-0 shadow-xl border-l border-slate-800">
          <div>
            {/* هدر سایدبار دسکتاپ */}
            <div className="p-5 border-b border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-white">میز کار ارزیاب</h2>
                <p className="text-[11px] text-emerald-400 font-medium">سنجش شایستگی‌ها</p>
              </div>
            </div>

            {/* منوی ناوبری سایدبار دسکتاپ */}
            <nav className="p-3 space-y-1.5">
              <Link
                href="/evaluator"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white transition text-slate-300"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                <span>داشبورد ارزیاب</span>
              </Link>

              <Link
                href="/evaluator/schools"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white transition text-emerald-300 bg-slate-800/40"
              >
                <School className="w-4 h-4 text-emerald-400" />
                <span>مدارس و کادر آموزشی</span>
              </Link>

              <Link
                href="/evaluator/evaluate"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition shadow-sm"
              >
                <ClipboardPenLine className="w-4 h-4 text-emerald-400" />
                <span>+ ثبت ارزیابی فرد جدید</span>
              </Link>

              <Link
                href="/evaluator/schools/new"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white transition text-slate-300"
              >
                <PlusCircle className="w-4 h-4 text-sky-400" />
                <span>ثبت شناسنامه مدرسه</span>
              </Link>

              <Link
                href="/evaluator/timesheets"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white transition text-slate-300"
              >
                <Clock className="w-4 h-4 text-purple-400" />
                <span>ثبت ساعت کاری</span>
              </Link>

              <Link
                href="/evaluator/my-evaluations"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white transition text-slate-300"
              >
                <History className="w-4 h-4 text-amber-400" />
                <span>سوابق ارزیابی‌های من</span>
              </Link>
            </nav>
          </div>

          {/* اطلاعات کاربر و خروج دسکتاپ */}
          <div className="p-4 border-t border-slate-800 space-y-3">
            <div className="px-3 py-2.5 rounded-xl bg-slate-800/60 flex items-center justify-between">
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
                <p className="text-[10px] text-emerald-400">ارزیاب رسمی</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج از حساب</span>
              </button>
            </form>
          </div>
        </aside>

        {/* محتوای اصلی صفحات ارزیاب (با فاصله مناسب از منوی پایین گوشی در موبایل) */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* منوی ناوبری چسبان پایین گوشی برای موبایل */}
      <EvaluatorBottomNav />
    </div>
  );
}
