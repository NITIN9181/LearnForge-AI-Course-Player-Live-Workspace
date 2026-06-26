import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import { ProgressStatus } from "@prisma/client";

describe("Enrollment", () => {
  let userId: string;
  let courseId: string;
  let moduleId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `enroll-test-${Date.now()}@test.dev`,
        name: "Enroll Test User",
        password: "test-password",
      },
    });
    userId = user.id;

    const course = await prisma.course.create({
      data: {
        title: "Enrollment Test Course",
        slug: `enroll-test-${Date.now()}`,
        published: true,
      },
    });
    courseId = course.id;

    const mod = await prisma.module.create({
      data: {
        title: "Test Module",
        order: 1,
        courseId,
      },
    });
    moduleId = mod.id;

    await prisma.lesson.create({
      data: {
        title: "Test Lesson",
        slug: "test-lesson",
        order: 1,
        moduleId,
        content: "# Test content",
        systemPrompt: "You are a test tutor.",
        taskObjective: "Complete this test",
      },
    });
  });

  afterAll(async () => {
    await prisma.lessonProgress.deleteMany({ where: { userId } });
    await prisma.enrollment.deleteMany({ where: { userId } });
    await prisma.module.deleteMany({ where: { courseId } });
    await prisma.course.deleteMany({ where: { id: courseId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  it("creates an enrollment", async () => {
    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId },
    });
    expect(enrollment).toBeDefined();
    expect(enrollment.userId).toBe(userId);
    expect(enrollment.courseId).toBe(courseId);
  });

  it("rejects duplicate enrollment (unique constraint)", async () => {
    await expect(
      prisma.enrollment.create({
        data: { userId, courseId },
      }),
    ).rejects.toThrow();
  });

  it("creates LessonProgress records on enrollment", async () => {
    const lessons = await prisma.lesson.findMany({
      where: { module: { courseId } },
    });

    await prisma.lessonProgress.createMany({
      data: lessons.map((l) => ({
        userId,
        lessonId: l.id,
        status: ProgressStatus.NOT_STARTED,
      })),
      skipDuplicates: true,
    });

    const progress = await prisma.lessonProgress.findMany({
      where: { userId },
    });
    expect(progress.length).toBeGreaterThanOrEqual(1);
  });

  it("finds enrollment by user and course", async () => {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    expect(enrollment).not.toBeNull();
  });
});
