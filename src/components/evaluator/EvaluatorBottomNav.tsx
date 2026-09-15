"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  School,
  ClipboardPenLine,
  Clock,
  History,
  Plus,
} from "lucide-react";

export function EvaluatorBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/evaluator",
      label: "داشبورد",
      icon: LayoutDashboard,
      isActive: pathname === "/evaluator",
    },
    {
      href: "/evaluator/schools",
      label: "مدارس",
      icon: School,
      isActive: pathname.startsWith("/evaluator/schools"),
    },
    // دکمه مرکزی ثبت ارزیابی به صورت جداگانه در وسط رندر می‌شود
    {
      href: "/evaluator/timesheets",
      label: "ساعت کاری",
      icon: Clock,
      isActive: pathname.startsWith("/evaluator/timesheets"),
    },
    {
      href: "/evaluator/my-evaluations",
      label: "سوابق من",
      icon: History,
      isActive: pathname.startsWith("/evaluator/my-evaluations"),
    },
  ];

  const isEvaluateActive = pathname.startsWith("/evaluator/evaluate");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around relative max-w-md mx-auto">
        {/* تب‌های اول و دوم: داشبورد و مدارس */}
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 relative ${
                item.isActive
                  ? "text-emerald-400 font-bold scale-105"
                  : "text-slate-400 hover:text-slate-200 font-medium"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${item.isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
              {item.isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5 animate-pulse"></span>
              )}
            </Link>
          );
        })}

        {/* دکمه مرکزی برجسته: ثبت ارزیابی فرد جدید */}
        <div className="flex flex-col items-center -mt-6">
          <Link
            href="/evaluator/evaluate"
            className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95 ${
              isEvaluateActive
                ? "bg-emerald-500 text-white ring-4 ring-emerald-400/30 shadow-emerald-500/50 scale-105"
                : "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white hover:brightness-110 shadow-emerald-900/50"
            }`}
            title="ثبت ارزیابی فرد جدید"
          >
            <Plus className="w-6 h-6 stroke-[2.8]" />
          </Link>
          <span
            className={`text-[10px] mt-1 font-bold ${
              isEvaluateActive ? "text-emerald-400" : "text-slate-300"
            }`}
          >
            + ارزیابی
          </span>
        </div>

        {/* تب‌های سوم و چهارم: ساعت کاری و سوابق */}
        {navItems.slice(2, 4).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 relative ${
                item.isActive
                  ? "text-emerald-400 font-bold scale-105"
                  : "text-slate-400 hover:text-slate-200 font-medium"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${item.isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
              {item.isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5 animate-pulse"></span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
