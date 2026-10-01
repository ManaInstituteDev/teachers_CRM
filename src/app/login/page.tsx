"use client";

import { useActionState, useState, useEffect } from "react";
import { loginAction } from "@/app/actions/auth";
import { GraduationCap, KeyRound, User, ArrowLeft, School, Sun, Moon, Lock, Timer, ShieldAlert } from "lucide-react";
import FluidBackground from "@/components/FluidBackground";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // تایمر ثانیه‌شمار معکوس در صورت قفل شدن
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);

  // هماهنگ‌سازی تایمر با پاسخ سرور
  useEffect(() => {
    if (state?.isLocked && typeof state?.remainingSeconds === "number") {
      setLockoutSeconds(state.remainingSeconds);
    }
  }, [state]);

  // کاهش ثانیه‌به‌ثانیه تایمر
  useEffect(() => {
    if (lockoutSeconds <= 0) return;

    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const isLight = theme === "light";
  const isLocked = lockoutSeconds > 0;

  // فرمت زمان به شکل mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* بوم شبیه‌سازی سیال دودی با حرکت موس */}
      <FluidBackground theme={theme} />

      {/* دکمه تغییر تم در گوشه صفحه */}
      <div className="fixed top-5 left-5 z-20">
        <button
          type="button"
          onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
          aria-label="تغییر حالت پس‌زمینه"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium backdrop-blur-md transition-all duration-300 shadow-lg cursor-pointer border ${
            isLight
              ? "bg-white/80 text-slate-700 border-slate-200/80 hover:bg-white hover:shadow-indigo-500/10"
              : "bg-slate-900/80 text-slate-200 border-slate-700/80 hover:bg-slate-900 hover:shadow-indigo-500/20"
          }`}
        >
          {isLight ? (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span>حالت تیره</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>حالت روشن</span>
            </>
          )}
        </button>
      </div>

      {/* کانتینر اصلی کارت لاگین */}
      <div className="relative z-10 w-full max-w-md">
        {/* هدر برندینگ */}
        <div className="text-center mb-6">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl transition-all duration-300 backdrop-blur-md border ${
              isLight
                ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-600 shadow-indigo-600/10"
                : "bg-indigo-600/30 border-indigo-400/30 text-indigo-400 shadow-indigo-500/10"
            }`}
          >
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 transition-colors duration-300 ${
              isLight ? "text-slate-800" : "text-white"
            }`}
          >
            سامانه ارزیابی و شبکه‌سازی معلمان
          </h1>
          <p
            className={`text-sm transition-colors duration-300 ${
              isLight ? "text-slate-600 font-medium" : "text-slate-400"
            }`}
          >
            پلتفرم ارزیابی ۵ محوره شایستگی و شناسنامه مدارس
          </p>
        </div>

        {/* کارت ورود شیشه‌ای (Glassmorphic) */}
        <div
          className={`backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 border ${
            isLight
              ? "bg-white/75 border-white/60 shadow-slate-300/40 text-slate-800"
              : "bg-slate-900/80 border-slate-700/60 shadow-black/50 text-slate-100"
          }`}
        >
          <form action={formAction} className="space-y-4">
            {/* پیام قفل موقت به دلیل ۵ بار اشتباه */}
            {isLocked ? (
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs font-semibold leading-relaxed shadow-inner">
                <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-300 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 animate-bounce text-amber-600 dark:text-amber-400" />
                  <span>دسترسی موقتاً مسدود شد!</span>
                </div>
                <p className="mb-3 text-slate-700 dark:text-slate-300">
                  به دلیل ۵ بار تلاش ناموفق متوالی، ورود به سامانه به مدت ۱ دقیقه متوقف شد.
                </p>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <Timer className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" />
                    <span>زمان باقی‌مانده:</span>
                  </span>
                  <span className="font-mono text-base font-extrabold text-amber-700 dark:text-amber-300 tracking-wider">
                    {formatTime(lockoutSeconds)}
                  </span>
                </div>
                {/* نوار پیشرفت ۶۰ ثانیه‌ای */}
                <div className="w-full bg-amber-200/50 dark:bg-amber-950/60 rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((60 - lockoutSeconds) / 60) * 100}%` }}
                  />
                </div>
              </div>
            ) : state?.error ? (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-semibold leading-relaxed flex items-center justify-between">
                <span>{state.error}</span>
                {typeof state.remainingAttempts === "number" && (
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[11px] font-bold">
                    {state.remainingAttempts} تلاش مانده
                  </span>
                )}
              </div>
            ) : null}

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 transition-colors ${
                  isLight ? "text-slate-700" : "text-slate-300"
                }`}
              >
                نام کاربری یا شماره همراه
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  required
                  disabled={isLocked}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="نام کاربری یا شماره همراه خود را وارد کنید"
                  className={`w-full rounded-xl px-3.5 py-2.5 pl-10 text-sm transition outline-none border focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isLight
                      ? "bg-white/80 border-slate-300/80 text-slate-800 placeholder:text-slate-400 focus:bg-white"
                      : "bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-950/90"
                  }`}
                />
                <User
                  className={`w-4 h-4 absolute left-3.5 top-3 ${
                    isLight ? "text-slate-400" : "text-slate-500"
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 transition-colors ${
                  isLight ? "text-slate-700" : "text-slate-300"
                }`}
              >
                رمز عبور
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  disabled={isLocked}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-xl px-3.5 py-2.5 pl-10 text-sm transition outline-none border focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isLight
                      ? "bg-white/80 border-slate-300/80 text-slate-800 placeholder:text-slate-400 focus:bg-white"
                      : "bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-950/90"
                  }`}
                />
                <KeyRound
                  className={`w-4 h-4 absolute left-3.5 top-3 ${
                    isLight ? "text-slate-400" : "text-slate-500"
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || isLocked}
              className={`w-full mt-2 py-3 px-4 font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                isLocked
                  ? "bg-slate-400 dark:bg-slate-700 text-slate-200 cursor-not-allowed opacity-75 shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 text-white shadow-indigo-600/30 cursor-pointer"
              }`}
            >
              {isLocked ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>امکان ورود قفل است ({lockoutSeconds}s)</span>
                </>
              ) : isPending ? (
                <span>در حال بررسی...</span>
              ) : (
                <>
                  <span>ورود به سامانه</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* فوتر اطلاعاتی */}
        <div
          className={`mt-6 text-center text-xs flex items-center justify-center gap-2 transition-colors ${
            isLight ? "text-slate-600 font-medium" : "text-slate-500"
          }`}
        >
          <School className="w-4 h-4" />
          <span>سامانه رصد و ارزیابی شایستگی‌های شبکه نخبگانی معلمان</span>
        </div>
      </div>
    </div>
  );
}


