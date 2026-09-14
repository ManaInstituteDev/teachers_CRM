"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createEvaluatorAction(prevState: any, formData: FormData) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return { error: "دسترسی غیرمجاز است." };
  }

  const fullName = formData.get("fullName") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string;

  if (!fullName || !username || !password) {
    return { error: "لطفاً تمام فیلدهای الزامی را تکمیل کنید." };
  }

  // بررسی تکراری نبودن نام کاربری
  const existingUser = await prisma.user.findUnique({
    where: { username: username.trim() },
  });

  if (existingUser) {
    return { error: "این نام کاربری قبلاً در سامانه ثبت شده است." };
  }

  await prisma.user.create({
    data: {
      fullName: fullName.trim(),
      username: username.trim(),
      password: password.trim(),
      phone: phone ? phone.trim() : null,
      role: "EVALUATOR",
      isActive: true,
    },
  });

  revalidatePath("/admin/evaluators");
  redirect("/admin/evaluators");
}

export async function toggleEvaluatorStatusAction(userId: string) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    throw new Error("دسترسی غیرمجاز");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== "EVALUATOR") {
    throw new Error("کاربر یافت نشد");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  revalidatePath("/admin/evaluators");
}
