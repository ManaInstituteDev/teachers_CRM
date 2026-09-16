"use client";

import { useActionState, useState } from "react";
import { createEvaluatorAction } from "@/app/actions/evaluator";
import Link from "next/link";
import {
  ArrowRight,
  UserPlus,
  ShieldAlert,
  KeyRound,
  Phone,
  User,
  Copy,
  Check,
  MessageSquareShare,
  RefreshCw,
} from "lucide-react";

export default function NewEvaluatorPage() {
  const [state, formAction, isPending] = useActionState(createEvaluatorAction, null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("123456");
  const [copied, setCopied] = useState(false);

  // پیشنهاد نام کاربری خودکار بر اساس شماره یا نام
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (!username || username.startsWith("09")) {
      setUsername(val);
    }
  };

  const generateRandomPassword = () => {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
    let pass = "";
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const smsMessage = `سلام ${fullName ? fullName : "همکار"} گرامی،
اطلاعات ورود شما به سامانه ارزیابی معلمان:
نام کاربری: ${username ? username : "---"}
رمز عبور: ${password ? password : "---"}
نشانی ورود: http://localhost:3000/login`;

  const copySms = () => {
    navigator.clipboard.writeText(smsMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6">
      {/* بازگشت */}
      <Link
        href="/admin/evaluators"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowRight className="w-4 h-4" />
        <span>بازگشت به لیست ارزیاب‌ها</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">تعریف دستی ارزیاب جدید</h1>
          <p className="text-xs text-slate-500 mt-1">
            مشخصات فردی و کلمه عبور را تعیین کنید. می‌توانید متن پیامک آماده را کپی کرده و به صورت دستی برای ارزیاب ارسال فرمایید.
          </p>
        </div>

        {state?.error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                نام و نام خانوادگی ارزیاب <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثال: دکتر علیرضا محمدی"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                شماره تلفن همراه (جهت ارسال پیامک) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                required
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="مثال: 09121234567"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm transition outline-none font-mono text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                نام کاربری برای ورود <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: 09121234567 یا نام کاربری دلخواه"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm transition outline-none font-mono text-left"
                dir="ltr"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                ارزیاب می‌تواند با نام کاربری یا شماره موبایل وارد شود.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  کلمه عبور <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>تولید رمز تصادفی</span>
                </button>
              </div>
              <input
                type="text"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="حداقل ۶ کاراکتر"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm transition outline-none font-mono text-left font-bold"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              شماره شبا ارزیاب جهت تسویه مالی (اختیاری)
            </label>
            <input
              type="text"
              name="shebaNumber"
              placeholder="مثال: IR120120000000001234567890 یا بدون IR"
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm transition outline-none font-mono text-left"
              dir="ltr"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              جهت گزارش‌گیری مالی و تسویه حق‌الزحمه ارزیابی در صفحه پایش ساعات کاری.
            </p>
          </div>

          {/* باکس آماده پیامک دستی */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 space-y-3 shadow-md border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <MessageSquareShare className="w-4 h-4" />
                <span>متن پیامک ارسالی (جهت ارسال دستی توسط ادمین):</span>
              </div>
              <button
                type="button"
                onClick={copySms}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی متن پیامک</span>
                  </>
                )}
              </button>
            </div>

            <pre className="text-xs font-mono bg-slate-950/80 p-3.5 rounded-xl text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-800">
              {smsMessage}
            </pre>
            <p className="text-[11px] text-slate-400">
              پس از فشردن دکمه «ثبت و ایجاد ارزیاب»، متن بالا را کپی کرده و در پیام‌رسان یا سامانه پیامک خود برای ارزیاب ارسال کنید.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href="/admin/evaluators"
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium transition"
            >
              انصراف
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              {isPending ? "در حال ذخیره..." : "ثبت و ایجاد ارزیاب"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
