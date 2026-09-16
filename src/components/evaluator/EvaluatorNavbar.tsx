"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import {
  UserCheck,
  LogOut,
  Bell,
  School,
  ClipboardPenLine,
  Menu,
  X,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";

interface EvaluatorNavbarProps {
  userName: string;
  phone?: string | null;
}

export function EvaluatorNavbar({ userName, phone }: EvaluatorNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // تعیین عنوان صفحه بر اساس مسیر فعلی
  const getPageTitle = () => {
    if (pathname === "/evaluator") return "داشبورد ارزیاب";
    if (pathname.startsWith("/evaluator/schools/new")) return "ثبت شناسنامه مدرسه";
    if (pathname.includes("/evaluate") && pathname.includes("/schools/")) return "ارزیابی تخصصی مدرسه";
    if (pathname.startsWith("/evaluator/schools")) return "مدارس و کادر آموزشی";
    if (pathname.startsWith("/evaluator/evaluate")) return "ثبت ارزیابی فرد جدید";
    if (pathname.startsWith("/evaluator/timesheets")) return "ثبت ساعت کاری";
    if (pathname.startsWith("/evaluator/my-evaluations")) return "سوابق ارزیابی‌های من";
    return "پنل ارزیاب";
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* بخش عنوان و لوگو */}
        <div className="flex items-center gap-3">
          <Link
            href="/evaluator"
            className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 hover:scale-105 transition"
          >
            <UserCheck className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 md:hidden">
                {getPageTitle()}
              </span>
              <span className="hidden md:inline font-bold text-sm text-white">
                سامانه ارزیابی معلمان
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ارزیاب
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              ثبت و ارزیابی شایستگی کادر و مدارس
            </p>
          </div>
        </div>

        {/* بخش راست: پروفایل و خروج */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* چیپ مشخصات ارزیاب */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              {userName.charAt(0)}
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold text-white truncate max-w-[130px]">{userName}</p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>آنلاین</span>
              </div>
            </div>
          </div>

          {/* دکمه منوی موبایل برای دسترسی به سایر امکانات */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
            aria-label="منو"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* دکمه خروج سریع */}
          <form action={logoutAction} className="hidden md:block">
            <button
              type="submit"
              title="خروج از حساب"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* منوی بازشونده موبایل برای امکانات تکمیلی */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                {userName.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{userName}</p>
                <p className="text-[10px] text-emerald-400 font-medium">ارزیاب رسمی سامانه</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              فعال
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              href="/evaluator/schools"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-slate-200 flex items-center gap-2 transition"
            >
              <School className="w-4 h-4 text-emerald-400" />
              <span>مدارس و کادر آموزشی</span>
            </Link>
            <Link
              href="/evaluator/timesheets"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-slate-200 flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>ثبت ساعت کاری</span>
            </Link>
          </div>

          <form action={logoutAction} className="pt-1">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج از حساب کاربری</span>
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
