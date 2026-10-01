"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  LogOut,
  Shield,
  BarChart3,
  Clock,
  UserCheck,
  PanelRightClose,
  PanelRightOpen,
  Menu,
  X,
  ChevronLeft,
  Receipt,
} from "lucide-react";

interface AdminSidebarProps {
  user: {
    fullName: string;
    username: string;
  };
  children: React.ReactNode;
}

export function AdminSidebar({ user, children }: AdminSidebarProps) {
  const pathname = usePathname();
  // وضعیت باز یا بسته بودن سایدبار در دسکتاپ
  const [isCollapsed, setIsCollapsed] = useState(false);
  // وضعیت دراور موبایل
  const [mobileOpen, setMobileOpen] = useState(false);

  // بازیابی وضعیت قبلی از localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // نادیده‌گرفتن خطا در محیط‌های فاقد دسترسی
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const navItems = [
    {
      href: "/admin",
      label: "داشبورد مدیریتی",
      icon: LayoutDashboard,
      color: "text-indigo-400",
    },
    {
      href: "/admin/analytics",
      label: "تحلیل داده‌ها و ارزیاب‌ها",
      icon: BarChart3,
      color: "text-purple-400",
    },
    {
      href: "/admin/teachers",
      label: "بانک معلمان و نتایج",
      icon: GraduationCap,
      color: "text-amber-400",
    },
    {
      href: "/admin/evaluators",
      label: "مدیریت ارزیاب‌ها",
      icon: Users,
      color: "text-emerald-400",
    },
    {
      href: "/admin/evaluators/assistants",
      label: "مدیریت کمک‌ارزیاب‌ها",
      icon: UserCheck,
      color: "text-sky-400",
    },
    {
      href: "/admin/timesheets",
      label: "پایش ساعات کاری",
      icon: Clock,
      color: "text-amber-400",
    },
    {
      href: "/admin/schools",
      label: "گزارش و شناسنامه مدارس",
      icon: School,
      color: "text-teal-400",
    },
    {
      href: "/admin/expenses",
      label: "تنخواه و مخارج مدارس",
      icon: Receipt,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 text-slate-800 relative">
      {/* هدر مخصوص موبایل */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm">پنل مدیریت سامانه</span>
            <span className="text-[10px] text-indigo-300 block">{user.fullName}</span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white transition"
          aria-label="منو"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* پس‌زمینه تیره دراور در موبایل */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* سایدبار دسکتاپ و دراور موبایل */}
      <aside
        className={`
          fixed md:sticky top-0 right-0 h-screen z-50 md:z-30
          bg-slate-900 text-slate-200 flex flex-col justify-between shrink-0 shadow-2xl md:shadow-xl
          border-l border-slate-800/80 transition-all duration-300 ease-in-out
          ${
            mobileOpen
              ? "translate-x-0 w-72"
              : "translate-x-full md:translate-x-0"
          }
          ${isCollapsed ? "md:w-20" : "md:w-64"}
        `}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* هدر سایدبار با دکمه جمع‌شدن / بازشدن */}
          <div
            className={`p-4 border-b border-slate-800/90 flex items-center justify-between ${
              isCollapsed ? "md:justify-center md:p-3" : ""
            }`}
          >
            {!isCollapsed && (
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h2 className="font-bold text-sm sm:text-base text-white truncate">
                    پنل مدیریت سامانه
                  </h2>
                  <p className="text-[11px] text-indigo-300 font-medium truncate">
                    مدیریت ارشد
                  </p>
                </div>
              </div>
            )}

            {/* دکمه جمع‌کردن / بازکردن سایدبار در دسکتاپ */}
            <button
              onClick={toggleCollapse}
              className={`hidden md:flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition cursor-pointer ${
                isCollapsed ? "w-10 h-10 bg-slate-800/80 text-indigo-300" : ""
              }`}
              title={isCollapsed ? "باز کردن پنل کناری (منو)" : "بستن پنل کناری برای دید کامل جدول"}
            >
              {isCollapsed ? (
                <PanelRightOpen className="w-5 h-5 text-indigo-400" />
              ) : (
                <PanelRightClose className="w-5 h-5" />
              )}
            </button>

            {/* دکمه بستن در موبایل */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* منوی ناوبری */}
          <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition group relative ${
                    isCollapsed ? "md:justify-center md:px-0" : ""
                  } ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? "text-white" : item.color
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}

                  {/* تولتیپ در حالت جمع‌شده */}
                  {isCollapsed && (
                    <span className="hidden md:group-hover:block absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-950 text-white text-xs whitespace-nowrap shadow-xl border border-slate-800 pointer-events-none z-50">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* فوتر کاربر و خروج */}
          <div className="p-3 border-t border-slate-800/90 space-y-2">
            {!isCollapsed ? (
              <div className="px-3 py-2 rounded-xl bg-slate-800/60 flex items-center justify-between">
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate">
                    {user.fullName}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    @{user.username}
                  </p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
              </div>
            ) : (
              <div
                className="w-10 h-10 mx-auto rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white text-xs"
                title={`${user.fullName} (@${user.username})`}
              >
                {user.fullName.charAt(0)}
              </div>
            )}

            <form action={logoutAction}>
              <button
                type="submit"
                className={`w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer ${
                  isCollapsed ? "p-2.5" : "px-3 py-2"
                }`}
                title="خروج از حساب"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>خروج</span>}
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* محتوای اصلی صفحه با انعطاف کامل */}
      <main className="flex-1 overflow-y-auto min-w-0 transition-all duration-300">
        {/* دکمه بازکردن سریع سایدبار در بالای صفحه در صورت جمع‌بودن سایدبار */}
        {isCollapsed && (
          <div className="hidden md:flex items-center gap-2 px-6 pt-4">
            <button
              onClick={toggleCollapse}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 text-xs font-bold shadow-xs hover:shadow-sm transition cursor-pointer"
              title="باز کردن پنل کناری"
            >
              <PanelRightOpen className="w-4 h-4 text-indigo-600" />
              <span>نمایش منوی کناری</span>
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
