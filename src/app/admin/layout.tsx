import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  LogOut,
  Shield,
  FileCheck,
  BarChart3,
  Clock,
  UserCheck,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 text-slate-800">
      {/* سایدبار ادمین */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-200 flex flex-col justify-between shrink-0 shadow-xl">
        <div>
          {/* هدر سایدبار */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">پنل مدیریت سامانه</h2>
              <p className="text-xs text-indigo-300 font-medium">سطح دسترسی: مدیر ارشد</p>
            </div>
          </div>

          {/* منوی ناوبری */}
          <nav className="p-4 space-y-1.5">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 hover:text-white transition"
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span>داشبورد مدیریتی</span>
            </Link>

            <Link
              href="/admin/analytics"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 hover:text-white transition"
            >
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>تحلیل داده‌ها و ارزیاب‌ها</span>
            </Link>

            <Link
              href="/admin/teachers"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 hover:text-white transition"
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>بانک معلمان و نتایج</span>
            </Link>

            <Link
              href="/admin/evaluators"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 hover:text-white transition"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>مدیریت ارزیاب‌ها</span>
            </Link>

            <Link
              href="/admin/evaluators/assistants"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 hover:text-white transition text-slate-300"
            >
              <UserCheck className="w-4 h-4 text-sky-400" />
              <span>مدیریت کمک‌ارزیاب‌ها</span>
            </Link>

            <Link
              href="/admin/timesheets"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 hover:text-white transition"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>پایش ساعات کاری</span>
            </Link>

            <Link
              href="/admin/schools"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 hover:text-white transition"
            >
              <School className="w-4 h-4 text-sky-400" />
              <span>گزارش و شناسنامه مدارس</span>
            </Link>
          </nav>
        </div>

        {/* بخش کاربر و خروج */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="px-3 py-2 rounded-xl bg-slate-800/60 flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
              <p className="text-[11px] text-slate-400">نام‌کاربری: {user.username}</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج از حساب</span>
            </button>
          </form>
        </div>
      </aside>

      {/* محتوای اصلی */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
