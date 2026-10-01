import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Receipt, Building2, Users } from "lucide-react";
import AdminExpensesClient, { ExpenseRow } from "@/components/admin/AdminExpensesClient";

export const dynamic = "force-dynamic";

export default async function AdminExpensesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const [expenses, schools, evaluators] = await Promise.all([
    prisma.schoolExpense.findMany({
      orderBy: { expenseDate: "desc" },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            code: true,
            city: true,
            district: true,
            pettyCashAmount: true,
            pettyCashPaid: true,
            pettyCashPaidAt: true,
          },
        },
        evaluator: {
          select: {
            id: true,
            fullName: true,
            username: true,
            shebaNumber: true,
          },
        },
      },
    }),
    prisma.school.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "EVALUATOR", isActive: true },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* هدر صفحه */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <span>مدیریت تنخواه و مخارج ارزیابان</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            پایش کلیه هزینه‌های ارزیابی مدارس (رفت‌وآمد، پذیرایی، اقلام مصرفی)، تایید فاکتورها و تسویه حساب مالی ارزیابان
          </p>
        </div>
      </div>

      {/* کامپوننت فیلترها و جدول تعاملی */}
      <AdminExpensesClient
        initialExpenses={expenses as unknown as ExpenseRow[]}
        schools={schools}
        evaluators={evaluators}
      />
    </div>
  );
}
