"use client";

import { useActionState } from "react";
import { createEvaluatorAction } from "@/app/actions/evaluator";
import Link from "next/link";
import { ArrowRight, UserPlus, ShieldAlert, KeyRound, Phone, User } from "lucide-react";

export default function NewEvaluatorPage() {
  const [state, formAction, isPending] = useActionState(createEvaluatorAction, null);

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-6">
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
            مشخصات فردی و کلمه عبور را تعیین کنید. ارزیاب پس از ایجاد می‌تواند با این مشخصات وارد سامانه شود.
          </p>
        </div>

        {state?.error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              نام و نام خانوادگی ارزیاب <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                required
                placeholder="مثال: دکتر علیرضا محمدی"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              شماره تلفن همراه
            </label>
            <div className="relative">
              <input
                type="text"
                name="phone"
                placeholder="مثال: 09121234567"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm transition outline-none"
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
                placeholder="مثال: evaluator_mohammadi"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm transition outline-none font-mono text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                کلمه عبور اولیه <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="password"
                required
                placeholder="حداقل ۶ کاراکتر"
                defaultValue="123456"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm transition outline-none font-mono text-left"
                dir="ltr"
              />
            </div>
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
