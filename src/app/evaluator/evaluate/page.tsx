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

  // دریافت فقط مدارس تخصیص‌یافته به همین ارزیاب
  const schools = await prisma.school.findMany({
    where: {
      assignedEvaluatorId: user.id,
    },
    select: {
      id: true,
      name: true,
      district: true,
    },
    orderBy: { name: "asc" },
  });

  if (schools.length === 0) {
    redirect("/evaluator/schools");
  }

  return <EvaluationFormClient schools={schools} initialSchoolId={schoolId} />;
}
