import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import EvaluationFormClient from "./EvaluationFormClient";

export const dynamic = "force-dynamic";

export default async function EvaluatorEvaluatePage({
  searchParams,
}: {
  searchParams: Promise<{ schoolId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { schoolId } = await searchParams;

  // دریافت لیست مدارس برای سلکت‌باکس
  const schools = await prisma.school.findMany({
    select: {
      id: true,
      name: true,
      district: true,
    },
    orderBy: { name: "asc" },
  });

  return <EvaluationFormClient schools={schools} initialSchoolId={schoolId} />;
}
