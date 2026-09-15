"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createAssistantEvaluatorAction(prevState: any, formData: FormData) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return { error: "دسترسی غیرمجاز است." };
  }

  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const nationalCode = formData.get("nationalCode") as string;
  const notes = formData.get("notes") as string;
  const evaluatorId = formData.get("evaluatorId") as string;

  if (!fullName || !evaluatorId) {
    return { error: "لطفاً نام کمک‌ارزیاب و ارزیاب مسئول متصل را انتخاب فرمایید." };
  }

  try {
    await prisma.assistantEvaluator.create({
      data: {
        fullName: fullName.trim(),
        phone: phone ? phone.trim() : null,
        nationalCode: nationalCode ? nationalCode.trim() : null,
        notes: notes ? notes.trim() : null,
        evaluatorId,
        isActive: true,
      },
    });

    revalidatePath("/admin/evaluators");
    revalidatePath("/admin/evaluators/assistants");
    revalidatePath("/admin/timesheets");
    return { success: true, message: "کمک‌ارزیاب با موفقیت به سیستم اضافه و به ارزیاب متصل شد." };
  } catch (err: any) {
    return { error: "خطا در ثبت کمک‌ارزیاب: " + (err.message || "خطای ناشناخته") };
  }
}

export async function updateAssistantEvaluatorAction(prevState: any, formData: FormData) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return { error: "دسترسی غیرمجاز است." };
  }

  const id = formData.get("id") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const nationalCode = formData.get("nationalCode") as string;
  const notes = formData.get("notes") as string;
  const evaluatorId = formData.get("evaluatorId") as string;

  if (!id || !fullName || !evaluatorId) {
    return { error: "اطلاعات ارسالی ناقص است." };
  }

  try {
    await prisma.assistantEvaluator.update({
      where: { id },
      data: {
        fullName: fullName.trim(),
        phone: phone ? phone.trim() : null,
        nationalCode: nationalCode ? nationalCode.trim() : null,
        notes: notes ? notes.trim() : null,
        evaluatorId,
      },
    });

    revalidatePath("/admin/evaluators");
    revalidatePath("/admin/evaluators/assistants");
    revalidatePath("/admin/timesheets");
    return { success: true, message: "اطلاعات کمک‌ارزیاب با موفقیت ویرایش شد." };
  } catch (err: any) {
    return { error: "خطا در ویرایش: " + (err.message || "خطای ناشناخته") };
  }
}

export async function toggleAssistantEvaluatorStatusAction(id: string) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    throw new Error("دسترسی غیرمجاز است.");
  }

  const assistant = await prisma.assistantEvaluator.findUnique({
    where: { id },
  });

  if (!assistant) {
    throw new Error("کمک‌ارزیاب یافت نشد.");
  }

  await prisma.assistantEvaluator.update({
    where: { id },
    data: { isActive: !assistant.isActive },
  });

  revalidatePath("/admin/evaluators");
  revalidatePath("/admin/evaluators/assistants");
  revalidatePath("/admin/timesheets");
}

export async function deleteAssistantEvaluatorAction(id: string) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    throw new Error("دسترسی غیرمجاز است.");
  }

  await prisma.assistantEvaluator.delete({
    where: { id },
  });

  revalidatePath("/admin/evaluators");
  revalidatePath("/admin/evaluators/assistants");
  revalidatePath("/admin/timesheets");
}
