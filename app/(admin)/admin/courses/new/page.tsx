import { CourseForm } from "@/components/admin/CourseForm";

export default function NewCoursePage() {
  return (
    <div>
      <h1 className="text-heading-1 text-forge-text mb-8">New Course</h1>
      <CourseForm mode="create" />
    </div>
  );
}
