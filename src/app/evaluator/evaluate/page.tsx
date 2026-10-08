import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import EvaluationFormClient from "./EvaluationFormClient";

export const dynamic = "force-dynamic";

export default async function EvaluatorEvaluatePage({
  searchParams,
}: {
  searchParams: Promise<{ schoolId?: string; teacherId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { schoolId, teacherId } = await searchParams;

  let effectiveSchoolId = schoolId;
  if (!effectiveSchoolId && teacherId) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { schoolId: true },
    });
    if (teacher?.schoolId) {
      effectiveSchoolId = teacher.schoolId;
    }
  }

  // دریافت فقط مدارس تخصیص‌یافته به همین ارزیاب همراه با کادر معلمان هر مدرسه
  const schools = await prisma.school.findMany({
    where: {
      assignedEvaluatorId: user.id,
    },
    select: {
      id: true,
      name: true,
      district: true,
      teachers: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          nationalCode: true,
          roleTitle: true,
          subject: true,
          grade: true,
          teachingYears: true,
          bio: true,
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      },
    },
    orderBy: { name: "asc" },
  });

  if (schools.length === 0) {
    redirect("/evaluator/schools");
  }

  return (
    <EvaluationFormClient
      schools={schools}
      initialSchoolId={effectiveSchoolId}
      initialTeacherId={teacherId}
    />
  );
}
