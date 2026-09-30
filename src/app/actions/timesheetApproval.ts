"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * تایید یا تعدیل ساعت کارکرد توسط مدیر سامانه
 */
export async function approveOrReviseTimesheetAction({
  logId,
  approvedMinutes,
  status,
  adminNotes,
}: {
  logId: string;
  approvedMinutes: number;
  status: "APPROVED" | "REVISED" | "REJECTED";
  adminNotes?: string;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { error: "دسترسی غیرمجاز. فقط مدیر سامانه امکان تایید ساعت کارکرد را دارد." };
  }

  try {
    await prisma.timesheetLog.update({
      where: { id: logId },
      data: {
        approvedMinutes: Math.max(0, approvedMinutes),
        status,
        adminNotes: adminNotes?.trim() || null,
      },
    });

    revalidatePath("/admin/timesheets");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    console.error("Error approving timesheet:", err);
    return { error: "خطا در ثبت تاییدیه ساعت کارکرد." };
  }
}

/**
 * تایید گروهی کلیه کارکردهای در انتظار یک ارزیاب
 */
export async function batchApproveEvaluatorTimesheetsAction(evaluatorId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { error: "دسترسی غیرمجاز." };
  }

  try {
    const pendingLogs = await prisma.timesheetLog.findMany({
      where: { evaluatorId, status: "PENDING" },
    });

    for (const log of pendingLogs) {
      await prisma.timesheetLog.update({
        where: { id: log.id },
        data: {
          approvedMinutes: log.durationMinutes,
          status: "APPROVED",
        },
      });
    }

    revalidatePath("/admin/timesheets");
    return { success: true, count: pendingLogs.length };
  } catch (err: any) {
    console.error("Error batch approving timesheets:", err);
    return { error: "خطا در تایید گروهی ساعت‌های کارکرد." };
  }
}

/**
 * تایید گروهی کلیه کارکردهای در انتظار یک کمک‌ارزیاب
 */
export async function batchApproveAssistantTimesheetsAction(assistantId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { error: "دسترسی غیرمجاز." };
  }

  try {
    const pendingLogs = await prisma.timesheetLog.findMany({
      where: { assistantEvaluatorId: assistantId, status: "PENDING" },
    });

    for (const log of pendingLogs) {
      await prisma.timesheetLog.update({
        where: { id: log.id },
        data: {
          approvedMinutes: log.durationMinutes,
          status: "APPROVED",
        },
      });
    }

    revalidatePath("/admin/timesheets");
    return { success: true, count: pendingLogs.length };
  } catch (err: any) {
    console.error("Error batch approving assistant timesheets:", err);
    return { error: "خطا در تایید گروهی ساعت‌های کارکرد کمک‌ارزیاب." };
  }
}

/**
 * به‌روزرسانی سریع شماره شبای ارزیاب (توسط مدیر یا خود ارزیاب)
 */
export async function updateEvaluatorShebaAction(userId: string, shebaNumber: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "لطفاً ابتدا وارد سامانه شوید." };
  }

  // فقط مدیر یا خود ارزیاب اجازه تغییر شماره شبای خود را دارد
  if (user.role !== "ADMIN" && user.id !== userId) {
    return { error: "دسترسی غیرمجاز." };
  }

  try {
    let cleanSheba = shebaNumber.replace(/\s+/g, "").toUpperCase();
    if (cleanSheba && !cleanSheba.startsWith("IR") && /^\d+$/.test(cleanSheba)) {
      cleanSheba = "IR" + cleanSheba;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        shebaNumber: cleanSheba.trim() || null,
      },
    });

    revalidatePath("/admin/timesheets");
    revalidatePath("/admin/evaluators");
    revalidatePath("/admin/schools");
    revalidatePath("/evaluator");
    revalidatePath("/evaluator/timesheets");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating evaluator sheba number:", err);
    return { error: "خطا در به‌روزرسانی شماره شبا." };
  }
}

/**
 * به‌روزرسانی شماره شبای کمک‌ارزیاب (توسط مدیر یا ارزیاب سرپرستش)
 */
export async function updateAssistantShebaAction(assistantId: string, shebaNumber: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "لطفاً ابتدا وارد سامانه شوید." };
  }

  try {
    const assistant = await prisma.assistantEvaluator.findUnique({
      where: { id: assistantId },
      select: { evaluatorId: true },
    });

    if (!assistant) {
      return { error: "کمک‌ارزیاب یافت نشد." };
    }

    // فقط مدیر یا ارزیاب سرپرست این کمک‌ارزیاب اجازه تغییر دارد
    if (user.role !== "ADMIN" && assistant.evaluatorId !== user.id) {
      return { error: "دسترسی غیرمجاز. فقط مدیر یا ارزیاب سرپرست امکان ویرایش دارند." };
    }

    let cleanSheba = shebaNumber.replace(/\s+/g, "").toUpperCase();
    if (cleanSheba && !cleanSheba.startsWith("IR") && /^\d+$/.test(cleanSheba)) {
      cleanSheba = "IR" + cleanSheba;
    }

    await prisma.assistantEvaluator.update({
      where: { id: assistantId },
      data: {
        shebaNumber: cleanSheba.trim() || null,
      },
    });

    revalidatePath("/admin/timesheets");
    revalidatePath("/admin/evaluators/assistants");
    revalidatePath("/evaluator");
    revalidatePath("/evaluator/timesheets");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating assistant sheba number:", err);
    return { error: "خطا در به‌روزرسانی شماره شبای کمک‌ارزیاب." };
  }
}
