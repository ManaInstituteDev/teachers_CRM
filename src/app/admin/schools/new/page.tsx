import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNewSchoolFormClient } from "./AdminNewSchoolFormClient";

export const dynamic = "force-dynamic";

export default async function AdminNewSchoolPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const evaluators = await prisma.user.findMany({
    where: { role: "EVALUATOR", isActive: true },
    select: {
      id: true,
      fullName: true,
      username: true,
      phone: true,
    },
    orderBy: { fullName: "asc" },
  });

  return <AdminNewSchoolFormClient evaluators={evaluators} />;
}
