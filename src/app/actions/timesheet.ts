"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { WorkerType } from "@/generated/prisma/client";

export async function logTimesheetAction(prevState: any, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "لطفاً ابتدا وارد حساب کاربری خود شوید." };
  }

  const workerType = (formData.get("workerType") as WorkerType) || "EVALUATOR";
  const assistantEvaluatorId = formData.get("assistantEvaluatorId") as string;
  const hours = parseFloat((formData.get("hours") as string) || "0");
  const minutes = parseInt((formData.get("minutes") as string) || "0", 10);
  const totalMinutes = Math.round(hours * 60) + minutes;
  const description = formData.get("description") as string;
  const schoolId = formData.get("schoolId") as string;
  const dateStr = formData.get("date") as string;

  if (workerType === "ASSISTANT_EVALUATOR" && !assistantEvaluatorId) {
    return { error: "لطفاً کمک‌ارزیاب مربوطه را انتخاب کنید." };
  }

  let targetEvaluatorId = user.id;

  // اگر ادمین است و ارزیاب دیگری را انتخاب کرده
  const adminSelectedEvaluatorId = formData.get("evaluatorId") as string;
  if (user.role === "ADMIN" && adminSelectedEvaluatorId) {
    targetEvaluatorId = adminSelectedEvaluatorId;
  }

  const logDate = dateStr ? new Date(dateStr) : new Date();

  // بررسی انتساب مدرسه به ارزیاب
  if (user.role !== "ADMIN" && schoolId) {
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, assignedEvaluatorId: true },
    });
    if (!school || school.assignedEvaluatorId !== user.id) {
      return { error: "این مدرسه به شما تخصیص داده نشده است." };
    }
  }

  // بررسی اطلاعات هزینه تنخواه (در صورت درج توسط کاربر)
  const expenseTitle = (formData.get("expenseTitle") as string)?.trim();
  const expenseAmountRaw = (formData.get("expenseAmount") as string) || "";
  const cleanedAmountStr = expenseAmountRaw.replace(/[^\d]/g, "");
  const expenseAmount = cleanedAmountStr ? parseInt(cleanedAmountStr, 10) : 0;
  const expenseCategory = (formData.get("expenseCategory") as string)?.trim() || null;
  const expenseDescription = (formData.get("expenseDescription") as string)?.trim() || null;

  const hasExpense = expenseAmount > 0 || Boolean(expenseTitle);
  const hasHours = totalMinutes > 0;

  if (!hasHours && !hasExpense) {
    return { error: "لطفاً مدت زمان کارکرد یا مبلغ هزینه تنخواه را وارد کنید." };
  }

  if (hasExpense) {
    if (!schoolId) {
      return { error: "برای ثبت هزینه و تنخواه، انتخاب مدرسه محل فعالیت الزامی است." };
    }
    if (!expenseTitle) {
      return { error: "لطفاً عنوان هزینه تنخواه (مانند کرایه رفت‌وآمد، پذیرایی، پرینت) را وارد کنید." };
    }
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      return { error: "مبلغ هزینه تنخواه باید عددی بیشتر از صفر (به تومان) باشد." };
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (hasHours) {
        await tx.timesheetLog.create({
          data: {
            evaluatorId: targetEvaluatorId,
            workerType,
            assistantEvaluatorId: workerType === "ASSISTANT_EVALUATOR" ? assistantEvaluatorId : null,
            durationMinutes: totalMinutes,
            description: description ? description.trim() : null,
            schoolId: schoolId || null,
            date: logDate,
          },
        });
      }

      if (hasExpense && schoolId && expenseAmount > 0) {
        await tx.schoolExpense.create({
          data: {
            title: expenseTitle,
            amount: expenseAmount,
            category: expenseCategory,
            description: expenseDescription || (description ? description.trim() : null),
            expenseDate: logDate,
            schoolId,
            evaluatorId: targetEvaluatorId,
            status: "PENDING",
          },
        });
      }
    });

    revalidatePath("/evaluator/timesheets");
    revalidatePath("/admin/timesheets");
    revalidatePath("/admin/analytics");
    revalidatePath("/admin/expenses");
    if (schoolId) {
      revalidatePath(`/admin/schools/${schoolId}`);
      revalidatePath(`/evaluator/schools/${schoolId}`);
    }

    let message = "گزارش فعالیت با موفقیت در سامانه ثبت شد.";
    if (hasHours && hasExpense) {
      message = "ساعت فعالیت و هزینه تنخواه با موفقیت در سامانه ثبت شدند.";
    } else if (hasExpense) {
      message = `فاکتور هزینه تنخواه به مبلغ ${expenseAmount.toLocaleString("fa-IR")} تومان با موفقیت ثبت شد.`;
    }

    return {
      success: true,
      message,
    };
  } catch (err: any) {
    return { error: "خطا در ثبت ساعت کاری یا هزینه: " + (err.message || "خطای ناشناخته") };
  }
}

export async function deleteTimesheetAction(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("دسترسی غیرمجاز");
  }

  const timesheet = await prisma.timesheetLog.findUnique({
    where: { id },
  });

  if (!timesheet) {
    throw new Error("رکورد کارکرد یافت نشد.");
  }

  // فقط خود ثبت‌کننده یا ادمین اجازه حذف دارد
  if (user.role !== "ADMIN" && timesheet.evaluatorId !== user.id) {
    throw new Error("شما مجاز به حذف این ساعت کاری نیستید.");
  }

  await prisma.timesheetLog.delete({
    where: { id },
  });

  revalidatePath("/evaluator/timesheets");
  revalidatePath("/admin/timesheets");
  revalidatePath("/admin/analytics");
}
