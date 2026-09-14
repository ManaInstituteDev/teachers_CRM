"use server";

import { prisma } from "@/lib/prisma";
import { setSession, clearSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "لطفاً نام کاربری و کلمه عبور را وارد کنید." };
  }

  // ارزیاب یا ادمین می‌تواند با نام کاربری یا شماره موبایل وارد شود
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: username.trim() },
        { phone: username.trim() },
      ],
    },
  });

  if (!user || user.password !== password.trim()) {
    return { error: "نام کاربری یا کلمه عبور نادرست است." };
  }

  if (!user.isActive) {
    return { error: "حساب کاربری شما غیرفعال شده است. با مدیر سیستم تماس بگیرید." };
  }

  await setSession({
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    role: user.role as "ADMIN" | "EVALUATOR",
    phone: user.phone,
  });

  if (user.role === "ADMIN") {
    redirect("/admin");
  } else {
    redirect("/evaluator");
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
