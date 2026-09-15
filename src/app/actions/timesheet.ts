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

  if (totalMinutes <= 0) {
    return { error: "مدت زمان کارکرد باید بیشتر از صفر باشد." };
  }

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

  try {
    await prisma.timesheetLog.create({
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

    revalidatePath("/evaluator/timesheets");
    revalidatePath("/admin/timesheets");
    revalidatePath("/admin/analytics");
    return { success: true, message: "ساعت کاری با موفقیت در سامانه ثبت شد." };
  } catch (err: any) {
    return { error: "خطا در ثبت ساعت کاری: " + (err.message || "خطای ناشناخته") };
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
