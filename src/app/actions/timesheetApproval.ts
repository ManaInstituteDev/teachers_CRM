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
 * به‌روزرسانی سریع شماره شبای ارزیاب توسط مدیر
 */
export async function updateEvaluatorShebaAction(userId: string, shebaNumber: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { error: "دسترسی غیرمجاز." };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        shebaNumber: shebaNumber.trim() || null,
      },
    });

    revalidatePath("/admin/timesheets");
    revalidatePath("/admin/evaluators");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating sheba number:", err);
    return { error: "خطا در به‌روزرسانی شماره شبا." };
  }
}
