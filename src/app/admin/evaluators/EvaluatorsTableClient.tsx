"use client";

import { useState } from "react";
import { Copy, Check, MessageSquare } from "lucide-react";
import { toggleEvaluatorStatusAction } from "@/app/actions/evaluator";

interface EvaluatorItem {
  id: string;
  fullName: string;
  username: string;
  password: string;
  phone: string | null;
  isActive: boolean;
  _count: {
    teacherEvaluations: number;
    createdSchools: number;
  };
}

export default function EvaluatorsTableClient({
  evaluators,
}: {
  evaluators: EvaluatorItem[];
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyEvaluatorSms = (ev: EvaluatorItem) => {
    const text = `سلام ${ev.fullName} گرامی،
اطلاعات ورود شما به سامانه ارزیابی معلمان:
نام کاربری: ${ev.username}
رمز عبور: ${ev.password}
نشانی ورود: http://localhost:3000/login`;

    navigator.clipboard.writeText(text);
    setCopiedId(ev.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 text-xs font-semibold">
            <tr>
              <th className="py-3.5 px-6">نام و نام خانوادگی</th>
              <th className="py-3.5 px-6">اطلاعات ورود ارسالی با پیامک</th>
              <th className="py-3.5 px-6">شماره همراه</th>
              <th className="py-3.5 px-6 text-center">ارزیابی‌های ثبت‌شده</th>
              <th className="py-3.5 px-6 text-center">مدارس ثبت‌شده</th>
              <th className="py-3.5 px-6 text-center">وضعیت دسترسی</th>
              <th className="py-3.5 px-6 text-left">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {evaluators.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                  هیچ ارزیابی تعریف نشده است. از دکمه «تعریف ارزیاب جدید» استفاده کنید.
                </td>
              </tr>
            ) : (
              evaluators.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 font-semibold text-slate-900">
                    {ev.fullName}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                        یوزر: <strong>{ev.username}</strong> | رمز: <strong>{ev.password}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyEvaluatorSms(ev)}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition cursor-pointer"
                        title="کپی متن پیامک برای ارسال مجدد"
                      >
                        {copiedId === ev.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">کپی شد!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>کپی پیامک</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-mono text-xs" dir="ltr">
                    {ev.phone || "—"}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                      {ev._count.teacherEvaluations} فرم
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700">
                      {ev._count.createdSchools} مدرسه
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {ev.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        فعال
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        غیرفعال
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-left">
                    <form action={toggleEvaluatorStatusAction.bind(null, ev.id)}>
                      <button
                        type="submit"
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                          ev.isActive
                            ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {ev.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
