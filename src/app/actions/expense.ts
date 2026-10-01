"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * ثبت هزینه جدید برای تنخواه مدرسه توسط ارزیاب یا مدیر
 */
export async function addSchoolExpenseAction({
  schoolId,
  title,
  amount,
  category,
  description,
  expenseDate,
}: {
  schoolId: string;
  title: string;
  amount: number;
  category?: string;
  description?: string;
  expenseDate?: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "لطفاً ابتدا وارد سامانه شوید." };
  }

  const cleanTitle = title?.trim();
  if (!cleanTitle) {
    return { error: "عنوان هزینه الزامی است (مانند کرایه رفت‌وآمد، پذیرایی، پرینت فرم‌ها)." };
  }

  const numAmount = Math.round(Number(amount));
  if (isNaN(numAmount) || numAmount <= 0) {
    return { error: "مبلغ هزینه باید عددی بزرگتر از صفر (به تومان) باشد." };
  }

  // بررسی وجود مدرسه و دسترسی ارزیاب
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true, assignedEvaluatorId: true },
  });

  if (!school) {
    return { error: "مدرسه مورد نظر یافت نشد." };
  }

  if (user.role !== "ADMIN" && school.assignedEvaluatorId !== user.id) {
    return { error: "شما به ثبت هزینه برای این مدرسه دسترسی ندارید." };
  }

  try {
    let date = new Date();
    if (expenseDate) {
      const parsed = new Date(expenseDate);
      if (!isNaN(parsed.getTime())) {
        date = parsed;
      }
    }

    const expense = await prisma.schoolExpense.create({
      data: {
        title: cleanTitle,
        amount: numAmount,
        category: category?.trim() || null,
        description: description?.trim() || null,
        expenseDate: date,
        schoolId,
        evaluatorId: user.id,
        status: "PENDING",
      },
      include: {
        evaluator: {
          select: { id: true, fullName: true, username: true },
        },
      },
    });

    revalidatePath("/evaluator/schools");
    revalidatePath(`/evaluator/schools/${schoolId}`);
    revalidatePath(`/admin/schools/${schoolId}`);
    revalidatePath("/admin/schools");
    revalidatePath("/admin/expenses");

    return { success: true, expense };
  } catch (err: any) {
    console.error("Error adding school expense:", err);
    return { error: "خطا در ثبت هزینه در پایگاه‌داده." };
  }
}

/**
 * ویرایش هزینه ثبت‌شده توسط ثبت‌کننده یا مدیر
 */
export async function updateSchoolExpenseAction({
  id,
  title,
  amount,
  category,
  description,
  expenseDate,
}: {
  id: string;
  title: string;
  amount: number;
  category?: string;
  description?: string;
  expenseDate?: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "لطفاً ابتدا وارد سامانه شوید." };
  }

  const existing = await prisma.schoolExpense.findUnique({
    where: { id },
  });

  if (!existing) {
    return { error: "مورد هزینه یافت نشد." };
  }

  if (user.role !== "ADMIN" && existing.evaluatorId !== user.id) {
    return { error: "شما اجازه ویرایش این هزینه را ندارید." };
  }

  const cleanTitle = title?.trim();
  if (!cleanTitle) {
    return { error: "عنوان هزینه الزامی است." };
  }

  const numAmount = Math.round(Number(amount));
  if (isNaN(numAmount) || numAmount <= 0) {
    return { error: "مبلغ هزینه نامعتبر است." };
  }

  try {
    let date = existing.expenseDate;
    if (expenseDate) {
      const parsed = new Date(expenseDate);
      if (!isNaN(parsed.getTime())) {
        date = parsed;
      }
    }

    const updated = await prisma.schoolExpense.update({
      where: { id },
      data: {
        title: cleanTitle,
        amount: numAmount,
        category: category?.trim() || null,
        description: description?.trim() || null,
        expenseDate: date,
        // اگر توسط ارزیاب ویرایش شود و رد شده بوده، مجدداً در وضعیت بررسی قرار گیرد
        status: user.role === "ADMIN" ? existing.status : "PENDING",
      },
      include: {
        evaluator: {
          select: { id: true, fullName: true, username: true },
        },
      },
    });

    revalidatePath("/evaluator/schools");
    revalidatePath(`/evaluator/schools/${existing.schoolId}`);
    revalidatePath(`/admin/schools/${existing.schoolId}`);
    revalidatePath("/admin/schools");
    revalidatePath("/admin/expenses");

    return { success: true, expense: updated };
  } catch (err: any) {
    console.error("Error updating school expense:", err);
    return { error: "خطا در به‌روزرسانی هزینه." };
  }
}

/**
 * حذف یک ردیف هزینه
 */
export async function deleteSchoolExpenseAction(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "لطفاً ابتدا وارد سامانه شوید." };
  }

  const existing = await prisma.schoolExpense.findUnique({
    where: { id },
  });

  if (!existing) {
    return { error: "مورد هزینه یافت نشد." };
  }

  if (user.role !== "ADMIN" && existing.evaluatorId !== user.id) {
    return { error: "شما اجازه حذف این هزینه را ندارید." };
  }

  try {
    await prisma.schoolExpense.delete({
      where: { id },
    });

    revalidatePath("/evaluator/schools");
    revalidatePath(`/evaluator/schools/${existing.schoolId}`);
    revalidatePath(`/admin/schools/${existing.schoolId}`);
    revalidatePath("/admin/schools");
    revalidatePath("/admin/expenses");

    return { success: true };
  } catch (err: any) {
    console.error("Error deleting school expense:", err);
    return { error: "خطا در حذف هزینه." };
  }
}

/**
 * بررسی، تایید یا رد هزینه توسط مدیر سامانه
 */
export async function updateExpenseStatusAction({
  id,
  status,
  adminNotes,
}: {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNotes?: string;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { error: "فقط مدیر سامانه اجازه بررسی و تایید وضعیت هزینه‌ها را دارد." };
  }

  try {
    const updated = await prisma.schoolExpense.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes?.trim() || null,
      },
    });

    revalidatePath(`/admin/schools/${updated.schoolId}`);
    revalidatePath(`/evaluator/schools/${updated.schoolId}`);
    revalidatePath("/admin/schools");
    revalidatePath("/admin/expenses");

    return { success: true, expense: updated };
  } catch (err: any) {
    console.error("Error updating expense status:", err);
    return { error: "خطا در تغییر وضعیت هزینه." };
  }
}

/**
 * تعیین یا ویرایش مبلغ تنخواه واریزی اولیه به ارزیاب توسط مدیر
 */
export async function updateSchoolPettyCashAllocationAction({
  schoolId,
  pettyCashAmount,
}: {
  schoolId: string;
  pettyCashAmount: number | null;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { error: "فقط مدیر سامانه اجازه تعیین سقف یا واریزی تنخواه را دارد." };
  }

  try {
    const val =
      pettyCashAmount !== null && !isNaN(Number(pettyCashAmount))
        ? Math.max(0, Math.round(Number(pettyCashAmount)))
        : null;

    const updated = await prisma.school.update({
      where: { id: schoolId },
      data: {
        pettyCashAmount: val,
      },
    });

    revalidatePath(`/admin/schools/${schoolId}`);
    revalidatePath(`/evaluator/schools/${schoolId}`);
    revalidatePath("/admin/schools");
    revalidatePath("/evaluator/schools");
    revalidatePath("/admin/expenses");

    return { success: true, school: updated };
  } catch (err: any) {
    console.error("Error updating school petty cash allocation:", err);
    return { error: "خطا در ثبت مبلغ تنخواه مصوب مدرسه." };
  }
}

/**
 * تغییر وضعیت واریز تنخواه به ارزیاب توسط مدیر (تیک واریز شد / نشد)
 */
export async function toggleSchoolPettyCashPaidAction({
  schoolId,
  isPaid,
}: {
  schoolId: string;
  isPaid: boolean;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { error: "فقط مدیر سامانه اجازه تغییر وضعیت واریز تنخواه را دارد." };
  }

  try {
    const updated = await prisma.school.update({
      where: { id: schoolId },
      data: {
        pettyCashPaid: isPaid,
        pettyCashPaidAt: isPaid ? new Date() : null,
      },
      select: {
        id: true,
        pettyCashAmount: true,
        pettyCashPaid: true,
        pettyCashPaidAt: true,
      },
    });

    revalidatePath(`/admin/schools/${schoolId}`);
    revalidatePath(`/evaluator/schools/${schoolId}`);
    revalidatePath("/admin/schools");
    revalidatePath("/evaluator/schools");
    revalidatePath("/admin/expenses");

    return { success: true, school: updated };
  } catch (err: any) {
    console.error("Error toggling school petty cash paid:", err);
    return { error: "خطا در به‌روزرسانی وضعیت واریز تنخواه." };
  }
}

/**
 * دریافت لیست کلیه هزینه‌های ثبت‌شده برای یک مدرسه به همراه خلاصه مالی
 */
export async function getSchoolExpensesAction(schoolId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "لطفاً ابتدا وارد شوید." };
  }

  try {
    const [school, expenses] = await Promise.all([
      prisma.school.findUnique({
        where: { id: schoolId },
        select: {
          id: true,
          name: true,
          code: true,
          pettyCashAmount: true,
          pettyCashPaid: true,
          pettyCashPaidAt: true,
          assignedEvaluatorId: true,
          assignedEvaluator: {
            select: { id: true, fullName: true, shebaNumber: true },
          },
        },
      }),
      prisma.schoolExpense.findMany({
        where: { schoolId },
        orderBy: { expenseDate: "desc" },
        include: {
          evaluator: {
            select: { id: true, fullName: true, username: true },
          },
        },
      }),
    ]);

    if (!school) {
      return { error: "مدرسه یافت نشد." };
    }

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const approvedAmount = expenses
      .filter((e) => e.status === "APPROVED")
      .reduce((sum, e) => sum + e.amount, 0);
    const pendingAmount = expenses
      .filter((e) => e.status === "PENDING")
      .reduce((sum, e) => sum + e.amount, 0);

    const pettyCash = school.pettyCashAmount || 0;
    // مانده تنخواه = تنخواه واریزی منهای مخارج انجام‌شده (مثبت: مانده تنخواه نزد ارزیاب، منفی: طلب ارزیاب از سازمان)
    const remainingBalance = pettyCash - totalAmount;

    return {
      success: true,
      school,
      expenses,
      summary: {
        totalAmount,
        approvedAmount,
        pendingAmount,
        pettyCashAmount: school.pettyCashAmount,
        pettyCashPaid: school.pettyCashPaid,
        pettyCashPaidAt: school.pettyCashPaidAt,
        remainingBalance,
      },
    };
  } catch (err: any) {
    console.error("Error getting school expenses:", err);
    return { error: "خطا در دریافت لیست هزینه‌ها." };
  }
}

