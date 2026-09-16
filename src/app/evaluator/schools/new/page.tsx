import { redirect } from "next/navigation";

export default function NewSchoolPage() {
  // ثبت مدارس جدید منحصراً در اختیار مدیر سیستم است
  redirect("/evaluator/schools");
}
