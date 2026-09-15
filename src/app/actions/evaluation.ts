"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CollaborationStatus, FamiliarityLevel } from "@/generated/prisma/client";
import { calculateAxisQualitative, calculateFinalCollaborationStatus } from "@/lib/scoring";

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
  const roleTitleInput = ((formData.get("roleTitle") as string) || "معلم").trim();
  const roleTitleCustom = ((formData.get("roleTitleCustom") as string) || "").trim();
  const roleTitle = (roleTitleInput === "سایر" && roleTitleCustom ? roleTitleCustom : roleTitleInput) || "معلم";
  const subject = formData.get("subject") as string;
  const grade = formData.get("grade") as string;
  const schoolId = formData.get("schoolId") as string;
  const schoolNameManual = formData.get("schoolNameManual") as string;
  const bio = formData.get("bio") as string;

  if (!teacherId && (!firstName || !lastName || !subject || !grade)) {
    return { error: "لطفاً اطلاعات هویتی، رشته و مقطع تدریس یا فعالیت را کامل کنید." };
  }

  // ۲. متادیتای ارزیابی
  const dialogueDurationMin = parseInt((formData.get("dialogueDurationMin") as string) || "30", 10);
  const familiarityLevel = (formData.get("familiarityLevel") as FamiliarityLevel) || "MEDIUM";

  // ۳. امتیازات محور ۱ (۱۵٪ - سقف ۵۰ نمره خام)
  const scoreAxis1_1 = Math.min(30, Math.max(0, parseInt((formData.get("scoreAxis1_1") as string) || "0", 10)));
  const scoreAxis1_2 = Math.min(20, Math.max(0, parseInt((formData.get("scoreAxis1_2") as string) || "0", 10)));
  const rawAxis1 = scoreAxis1_1 + scoreAxis1_2;
  const qualitativeAxis1 = calculateAxisQualitative(1, rawAxis1);
  const notesAxis1 = formData.get("notesAxis1") as string;

  // ۴. امتیازات محور ۲ (۲۵٪ - سقف ۸۰ نمره خام)
  const scoreAxis2_1 = Math.min(30, Math.max(0, parseInt((formData.get("scoreAxis2_1") as string) || "0", 10)));
  const scoreAxis2_2 = Math.min(30, Math.max(0, parseInt((formData.get("scoreAxis2_2") as string) || "0", 10)));
  const scoreAxis2_3 = Math.min(20, Math.max(0, parseInt((formData.get("scoreAxis2_3") as string) || "0", 10)));
  const rawAxis2 = scoreAxis2_1 + scoreAxis2_2 + scoreAxis2_3;
  const qualitativeAxis2 = calculateAxisQualitative(2, rawAxis2);

  // ۵. امتیازات محور ۳ (۱۵٪ - سقف ۱۰۰ نمره خام)
  const scoreAxis3_1 = Math.min(35, Math.max(0, parseInt((formData.get("scoreAxis3_1") as string) || "0", 10)));
  const scoreAxis3_2 = Math.min(35, Math.max(0, parseInt((formData.get("scoreAxis3_2") as string) || "0", 10)));
  const scoreAxis3_3 = Math.min(30, Math.max(0, parseInt((formData.get("scoreAxis3_3") as string) || "0", 10)));
  const rawAxis3 = scoreAxis3_1 + scoreAxis3_2 + scoreAxis3_3;
  const qualitativeAxis3 = calculateAxisQualitative(3, rawAxis3);

  // ۶. امتیازات محور ۴ (۲۵٪ - سقف ۱۰۰ نمره خام)
  const scoreAxis4_1 = Math.min(35, Math.max(0, parseInt((formData.get("scoreAxis4_1") as string) || "0", 10)));
  const scoreAxis4_2 = Math.min(35, Math.max(0, parseInt((formData.get("scoreAxis4_2") as string) || "0", 10)));
  const scoreAxis4_3 = Math.min(30, Math.max(0, parseInt((formData.get("scoreAxis4_3") as string) || "0", 10)));
  const rawAxis4 = scoreAxis4_1 + scoreAxis4_2 + scoreAxis4_3;
  const qualitativeAxis4 = calculateAxisQualitative(4, rawAxis4);

  // ۷. امتیازات محور ۵ (۲۰٪ - سقف ۷۵ نمره خام)
  const scoreAxis5_1 = Math.min(30, Math.max(0, parseInt((formData.get("scoreAxis5_1") as string) || "0", 10)));
  const scoreAxis5_2 = Math.min(20, Math.max(0, parseInt((formData.get("scoreAxis5_2") as string) || "0", 10)));
  const scoreAxis5_3 = Math.min(25, Math.max(0, parseInt((formData.get("scoreAxis5_3") as string) || "0", 10)));
  const rawAxis5 = scoreAxis5_1 + scoreAxis5_2 + scoreAxis5_3;
  const qualitativeAxis5 = calculateAxisQualitative(5, rawAxis5);

  // ۸. محاسبه نمره موزون کل (از ۱۰۰ نمره)
  const weighted1 = (rawAxis1 / 50) * 15;
  const weighted2 = (rawAxis2 / 80) * 25;
  const weighted3 = (rawAxis3 / 100) * 15;
  const weighted4 = (rawAxis4 / 100) * 25;
  const weighted5 = (rawAxis5 / 75) * 20;

  const totalWeightedScore = parseFloat(
    (weighted1 + weighted2 + weighted3 + weighted4 + weighted5).toFixed(2)
  );

  const calculatedStatus = calculateFinalCollaborationStatus(totalWeightedScore);
  const finalRecommendation = (formData.get("finalRecommendation") as CollaborationStatus) || calculatedStatus;
  const finalNotes = formData.get("finalNotes") as string;

  try {
    let activeTeacherId = teacherId;

    if (!activeTeacherId) {
      // ایجاد فرد جدید (معلم، مشاور، معاون، ...)
      const newTeacher = await prisma.teacher.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone ? phone.trim() : null,
          nationalCode: nationalCode ? nationalCode.trim() : null,
          teachingYears,
          roleTitle: roleTitle || "معلم",
          subject: subject.trim(),
          grade: grade.trim(),
          schoolId: schoolId || null,
          schoolNameManual: schoolNameManual ? schoolNameManual.trim() : null,
          collaborationStatus: finalRecommendation,
          bio: bio ? bio.trim() : null,
        },
      });
      activeTeacherId = newTeacher.id;
    } else {
      // به‌روزرسانی وضعیت همکاری و نقش فرد موجود
      await prisma.teacher.update({
        where: { id: activeTeacherId },
        data: {
          collaborationStatus: finalRecommendation,
          ...(roleTitle ? { roleTitle } : {}),
          ...(bio ? { bio: bio.trim() } : {}),
        },
      });
    }

    // ثبت فرم تفصیلی ارزیابی
    await prisma.teacherEvaluation.create({
      data: {
        teacherId: activeTeacherId,
        evaluatorId: user.id,
        dialogueDurationMin,
        familiarityLevel,

        // محور ۱
        scoreAxis1_1,
        scoreAxis1_2,
        rawAxis1,
        qualitativeAxis1,
        notesAxis1: notesAxis1 ? notesAxis1.trim() : null,

        // محور ۲
        scoreAxis2_1,
        scoreAxis2_2,
        scoreAxis2_3,
        rawAxis2,
        qualitativeAxis2,

        // محور ۳
        scoreAxis3_1,
        scoreAxis3_2,
        scoreAxis3_3,
        rawAxis3,
        qualitativeAxis3,

        // محور ۴
        scoreAxis4_1,
        scoreAxis4_2,
        scoreAxis4_3,
        rawAxis4,
        qualitativeAxis4,

        // محور ۵
        scoreAxis5_1,
        scoreAxis5_2,
        scoreAxis5_3,
        rawAxis5,
        qualitativeAxis5,

        totalWeightedScore,
        finalRecommendation,
        finalNotes: finalNotes ? finalNotes.trim() : null,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/teachers");
    revalidatePath("/admin/analytics");
    revalidatePath("/evaluator");
    revalidatePath("/evaluator/schools");
    revalidatePath("/evaluator/my-evaluations");
    redirect(user.role === "ADMIN" ? `/admin/teachers/${activeTeacherId}` : `/evaluator/my-evaluations`);
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    return { error: "خطا در ثبت ارزیابی: " + (err.message || "لطفاً ورودی‌ها را بررسی کنید.") };
  }
}
