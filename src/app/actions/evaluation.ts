"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CollaborationStatus, FamiliarityLevel } from "@/generated/prisma/client";

export async function submitEvaluationAction(prevState: any, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "لطفاً مجدداً وارد سامانه شوید." };
  }

  // ۱. مشخصات معلم
  const teacherId = formData.get("teacherId") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;
  const nationalCode = formData.get("nationalCode") as string;
  const teachingYears = parseInt((formData.get("teachingYears") as string) || "0", 10);
  const subject = formData.get("subject") as string;
  const grade = formData.get("grade") as string;
  const schoolId = formData.get("schoolId") as string;
  const schoolNameManual = formData.get("schoolNameManual") as string;

  if (!teacherId && (!firstName || !lastName || !subject || !grade)) {
    return { error: "لطفاً اطلاعات هویتی و تدریس معلم را کامل کنید." };
  }

  // ۲. متادیتای ارزیابی
  const dialogueDurationMin = parseInt((formData.get("dialogueDurationMin") as string) || "30", 10);
  const familiarityLevel = (formData.get("familiarityLevel") as FamiliarityLevel) || "MEDIUM";

  // ۳. امتیازات محور ۱ (۱۵٪)
  const scoreAxis1_1 = Math.min(30, Math.max(0, parseInt((formData.get("scoreAxis1_1") as string) || "0", 10)));
  const scoreAxis1_2 = Math.min(20, Math.max(0, parseInt((formData.get("scoreAxis1_2") as string) || "0", 10)));
  const scoreAxis1_3 = Math.min(20, Math.max(0, parseInt((formData.get("scoreAxis1_3") as string) || "0", 10)));
  const scoreAxis1_4 = Math.min(30, Math.max(0, parseInt((formData.get("scoreAxis1_4") as string) || "0", 10)));
  const rawAxis1 = scoreAxis1_1 + scoreAxis1_2 + scoreAxis1_3 + scoreAxis1_4;
  const qualitativeAxis1 = formData.get("qualitativeAxis1") as string;
  const notesAxis1 = formData.get("notesAxis1") as string;

  // ۴. امتیازات محور ۲ (۲۵٪)
  const scoreAxis2_1 = Math.min(30, Math.max(0, parseInt((formData.get("scoreAxis2_1") as string) || "0", 10)));
  const scoreAxis2_2 = Math.min(30, Math.max(0, parseInt((formData.get("scoreAxis2_2") as string) || "0", 10)));
  const scoreAxis2_3 = Math.min(20, Math.max(0, parseInt((formData.get("scoreAxis2_3") as string) || "0", 10)));
  const scoreAxis2_4 = Math.min(20, Math.max(0, parseInt((formData.get("scoreAxis2_4") as string) || "0", 10)));
  const rawAxis2 = scoreAxis2_1 + scoreAxis2_2 + scoreAxis2_3 + scoreAxis2_4;

  // ۵. امتیازات محور ۳ (۱۵٪)
  const scoreAxis3_1 = Math.min(35, Math.max(0, parseInt((formData.get("scoreAxis3_1") as string) || "0", 10)));
  const scoreAxis3_2 = Math.min(35, Math.max(0, parseInt((formData.get("scoreAxis3_2") as string) || "0", 10)));
  const scoreAxis3_3 = Math.min(30, Math.max(0, parseInt((formData.get("scoreAxis3_3") as string) || "0", 10)));
  const rawAxis3 = scoreAxis3_1 + scoreAxis3_2 + scoreAxis3_3;
  const qualitativeAxis3 = formData.get("qualitativeAxis3") as string;

  // ۶. امتیازات محور ۴ (۲۵٪)
  const scoreAxis4_1 = Math.min(35, Math.max(0, parseInt((formData.get("scoreAxis4_1") as string) || "0", 10)));
  const scoreAxis4_2 = Math.min(35, Math.max(0, parseInt((formData.get("scoreAxis4_2") as string) || "0", 10)));
  const scoreAxis4_3 = Math.min(30, Math.max(0, parseInt((formData.get("scoreAxis4_3") as string) || "0", 10)));
  const rawAxis4 = scoreAxis4_1 + scoreAxis4_2 + scoreAxis4_3;
  const qualitativeAxis4 = formData.get("qualitativeAxis4") as string;

  // ۷. امتیازات محور ۵ (۲۰٪)
  const scoreAxis5_1 = Math.min(30, Math.max(0, parseInt((formData.get("scoreAxis5_1") as string) || "0", 10)));
  const scoreAxis5_2 = Math.min(20, Math.max(0, parseInt((formData.get("scoreAxis5_2") as string) || "0", 10)));
  const scoreAxis5_3 = Math.min(25, Math.max(0, parseInt((formData.get("scoreAxis5_3") as string) || "0", 10)));
  const scoreAxis5_4 = Math.min(25, Math.max(0, parseInt((formData.get("scoreAxis5_4") as string) || "0", 10)));
  const rawAxis5 = scoreAxis5_1 + scoreAxis5_2 + scoreAxis5_3 + scoreAxis5_4;
  const qualitativeAxis5 = formData.get("qualitativeAxis5") as string;

  // ۸. نمره کل موزون از ۱۰۰
  const totalWeightedScore = Number(
    (
      rawAxis1 * 0.15 +
      rawAxis2 * 0.25 +
      rawAxis3 * 0.15 +
      rawAxis4 * 0.25 +
      rawAxis5 * 0.2
    ).toFixed(2)
  );

  const finalRecommendation = (formData.get("finalRecommendation") as CollaborationStatus) || "DEVELOPMENTAL_RELATION";
  const finalNotes = formData.get("finalNotes") as string;

  try {
    let activeTeacherId = teacherId;

    if (!activeTeacherId) {
      // ایجاد معلم جدید
      const newTeacher = await prisma.teacher.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone ? phone.trim() : null,
          nationalCode: nationalCode ? nationalCode.trim() : null,
          teachingYears,
          subject: subject.trim(),
          grade: grade.trim(),
          schoolId: schoolId || null,
          schoolNameManual: schoolNameManual ? schoolNameManual.trim() : null,
          collaborationStatus: finalRecommendation,
        },
      });
      activeTeacherId = newTeacher.id;
    } else {
      // به‌روزرسانی وضعیت همکاری معلم موجود
      await prisma.teacher.update({
        where: { id: activeTeacherId },
        data: {
          collaborationStatus: finalRecommendation,
        },
      });
    }

    // ایجاد رکورد ارزیابی
    await prisma.teacherEvaluation.create({
      data: {
        teacherId: activeTeacherId,
        evaluatorId: user.id,
        dialogueDurationMin,
        familiarityLevel,

        scoreAxis1_1,
        scoreAxis1_2,
        scoreAxis1_3,
        scoreAxis1_4,
        rawAxis1,
        qualitativeAxis1,
        notesAxis1,

        scoreAxis2_1,
        scoreAxis2_2,
        scoreAxis2_3,
        scoreAxis2_4,
        rawAxis2,

        scoreAxis3_1,
        scoreAxis3_2,
        scoreAxis3_3,
        rawAxis3,
        qualitativeAxis3,

        scoreAxis4_1,
        scoreAxis4_2,
        scoreAxis4_3,
        rawAxis4,
        qualitativeAxis4,

        scoreAxis5_1,
        scoreAxis5_2,
        scoreAxis5_3,
        scoreAxis5_4,
        rawAxis5,
        qualitativeAxis5,

        totalWeightedScore,
        finalRecommendation,
        finalNotes,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/teachers");
    revalidatePath("/evaluator");
    revalidatePath("/evaluator/my-evaluations");
    redirect(user.role === "ADMIN" ? `/admin/teachers/${activeTeacherId}` : `/evaluator/my-evaluations`);
  } catch (err: any) {
    return { error: "خطا در ثبت ارزیابی: " + (err.message || "لطفاً مجدداً بررسی کنید.") };
  }
}
