"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SchoolOwnership, AdmissionType, SchoolDominantApproach, HumanitiesAttitude } from "@/generated/prisma/client";

export async function createSchoolAction(prevState: any, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "لطفاً مجدداً وارد سامانه شوید." };
  }

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const province = (formData.get("province") as string) || "تهران";
  const city = (formData.get("city") as string) || "تهران";
  const district = formData.get("district") as string;
  const address = formData.get("address") as string;

  const ownershipType = formData.get("ownershipType") as SchoolOwnership;
  const ownershipOther = formData.get("ownershipOther") as string;
  const admissionType = formData.get("admissionType") as AdmissionType;
  const dominantApproach = formData.get("dominantApproach") as SchoolDominantApproach;
  const approachEvidence = formData.get("approachEvidence") as string;

  const humanitiesAttitude = (formData.get("humanitiesAttitude") as HumanitiesAttitude) || null;
  const humanitiesReadinessLevel = formData.get("humanitiesReadinessLevel") as string;

  // دریافت چک‌باکس‌های آرایه‌ای
  const humanitiesActivities = formData.getAll("humanitiesActivities") as string[];
  const studentCapacities = formData.getAll("studentCapacities") as string[];

  if (!name || !district) {
    return { error: "نام مدرسه و منطقه آموزش و پرورش الزامی هستند." };
  }

  try {
    const school = await prisma.school.create({
      data: {
        name: name.trim(),
        code: code ? code.trim() : null,
        province: province.trim(),
        city: city.trim(),
        district: district.trim(),
        address: address ? address.trim() : null,
        ownershipType: ownershipType || "GOVERNMENTAL",
        ownershipOther: ownershipOther ? ownershipOther.trim() : null,
        admissionType: admissionType || "PUBLIC",
        dominantApproach: dominantApproach || "EDUCATIONAL_CULTURAL",
        approachEvidence: approachEvidence ? approachEvidence.trim() : null,
        humanitiesAttitude,
        humanitiesActivities,
        studentCapacities,
        humanitiesReadinessLevel: humanitiesReadinessLevel ? humanitiesReadinessLevel.trim() : null,
        createdById: user.id,
      },
    });

    revalidatePath("/admin/schools");
    revalidatePath("/evaluator");
    redirect(user.role === "ADMIN" ? `/admin/schools/${school.id}` : `/evaluator`);
  } catch (err: any) {
    if (err.code === "P2002") {
      return { error: "کد مدرسه وارد شده قبلاً در سیستم ثبت شده است." };
    }
    return { error: "خطا در ثبت شناسنامه مدرسه: " + (err.message || "مجدداً تلاش کنید.") };
  }
}
