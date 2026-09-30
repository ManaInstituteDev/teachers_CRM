"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { GraduationCap, KeyRound, User, ArrowLeft, School } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6 text-slate-100">
      <div className="w-full max-w-md">
        {/* هدر برندینگ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            سامانه ارزیابی و شبکه‌سازی معلمان
          </h1>
          <p className="text-sm text-slate-400">
            پلتفرم ارزیابی ۵ محوره شایستگی و شناسنامه مدارس
          </p>
        </div>

        {/* کارت ورود */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium leading-relaxed">
                {state.error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                نام کاربری یا شماره همراه
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="نام کاربری یا شماره همراه خود را وارد کنید"
                  className="w-full bg-slate-900/60 border border-slate-700 focus:ring-2 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-white placeholder:text-slate-500 transition outline-none"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                رمز عبور
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/60 border border-slate-700 focus:ring-2 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-white placeholder:text-slate-500 transition outline-none"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              {isPending ? (
                <span>در حال ورود...</span>
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
        <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <School className="w-4 h-4" />
          <span>سامانه رصد و ارزیابی شایستگی‌های شبکه نخبگانی معلمان</span>
        </div>
      </div>
    </div>
  );
}
