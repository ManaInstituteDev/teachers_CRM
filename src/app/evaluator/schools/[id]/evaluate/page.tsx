import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { SchoolEvaluationFormClient } from "./SchoolEvaluationFormClient";

export const dynamic = "force-dynamic";

export default async function EvaluatorSchoolEvaluationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const school = await prisma.school.findUnique({
    where: { id },
  });

  if (!school) {
    notFound();
  }

  if (school.assignedEvaluatorId !== user.id) {
    redirect("/evaluator/schools");
  }

  return (
    <SchoolEvaluationFormClient
      school={{
        id: school.id,
        name: school.name,
        code: school.code,
        province: school.province,
        district: school.district,
        principalName: school.principalName,
        dominantApproach: school.dominantApproach,
        approachEvidence: school.approachEvidence,
        humanitiesAttitude: school.humanitiesAttitude,
        humanitiesActivities: school.humanitiesActivities,
        studentCapacities: school.studentCapacities,
        humanitiesReadinessLevel: school.humanitiesReadinessLevel,
      }}
    />
  );
}
