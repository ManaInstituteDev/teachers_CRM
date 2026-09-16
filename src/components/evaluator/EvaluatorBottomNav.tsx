"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  School,
  Clock,
  History,
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
      label: "مدارس و کادر",
      icon: School,
      isActive: pathname.startsWith("/evaluator/schools"),
    },
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

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-3 py-2 shadow-2xl">
      <div className="grid grid-cols-4 items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 relative ${
                item.isActive
                  ? "text-emerald-400 font-bold scale-105"
                  : "text-slate-400 hover:text-slate-200 font-medium"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${item.isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[10px] tracking-tight truncate max-w-[70px] text-center">{item.label}</span>
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
