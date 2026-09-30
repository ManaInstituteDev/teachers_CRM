"use server";

import { prisma } from "@/lib/prisma";
import { setSession, clearSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { checkLoginAttempts, recordFailedLogin, resetLoginAttempts } from "@/lib/loginRateLimit";

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "لطفاً نام کاربری و کلمه عبور را وارد کنید." };
  }

  const cleanUsername = username.trim();

  // ۱. بررسی وضعیت قفل حساب به دلیل تلاش‌های ناموفق قبلی
  const attemptStatus = checkLoginAttempts(cleanUsername);
  if (attemptStatus.isLocked) {
    return {
      error: `به دلیل ۵ بار تلاش ناموفق، امکان ورود به مدت ۱ دقیقه مسدود شده است. لطفاً ${attemptStatus.remainingSeconds} ثانیه دیگر مجدداً تلاش کنید.`,
      isLocked: true,
      remainingSeconds: attemptStatus.remainingSeconds,
    };
  }

  // ارزیاب یا ادمین می‌تواند با نام کاربری یا شماره موبایل وارد شود
  let user;
  try {
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { phone: cleanUsername },
        ],
      },
    });
  } catch (err: any) {
    console.error("Login database connection error:", err);
    return {
      error:
        "خطا در برقراری ارتباط با پایگاه‌داده. لطفاً از اتصال دیتابیس ابری و تنظیم صحیح متغیر DATABASE_URL در پنل ورسل اطمینان حاصل کنید.",
    };
  }

  if (!user || user.password !== password.trim()) {
    // ۲. ثبت تلاش ناموفق
    const failedStatus = recordFailedLogin(cleanUsername);
    if (failedStatus.isLocked) {
      return {
        error: "رمز عبور یا نام کاربری ۵ بار اشتباه وارد شد. امکان ورود به مدت ۱ دقیقه مسدود گردید.",
        isLocked: true,
        remainingSeconds: failedStatus.remainingSeconds,
      };
    }

    return {
      error: `نام کاربری یا کلمه عبور نادرست است. (${failedStatus.remainingAttempts} تلاش مجاز باقی‌مانده)`,
      isLocked: false,
      remainingAttempts: failedStatus.remainingAttempts,
    };
  }

  if (!user.isActive) {
    return { error: "حساب کاربری شما غیرفعال شده است. با مدیر سیستم تماس بگیرید." };
  }

  // ۳. در صورت ورود موفق، شمارنده تلاش‌های این کاربر ریست می‌شود
  resetLoginAttempts(cleanUsername);

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

