import { cookies } from "next/headers";
import { prisma } from "./prisma";

export interface SessionUser {
  id: string;
  fullName: string;
  username: string;
  role: "ADMIN" | "EVALUATOR";
  phone?: string | null;
}

const COOKIE_NAME = "teachers_crm_session";

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie?.value) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString("utf-8")
    ) as SessionUser;

    // تایید کاربر از دیتابیس برای امنیت و بررسی وضعیت فعال بودن
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, fullName: true, username: true, role: true, phone: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      role: user.role as "ADMIN" | "EVALUATOR",
      phone: user.phone,
    };
  } catch {
    return null;
  }
}

export async function setSession(user: SessionUser) {
  const cookieStore = await cookies();
  const sessionData = Buffer.from(JSON.stringify(user)).toString("base64");

  cookieStore.set(COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // ۷ روز
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
