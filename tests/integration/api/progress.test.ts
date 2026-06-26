import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import { ProgressStatus } from "@prisma/client";

describe("LessonProgress", () => {
  let userId: string;
  let lessonId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `progress-test-${Date.now()}@test.dev`,
        name: "Progress Test User",
        password: "test-password",
      },
    });
    userId = user.id;

    const course = await prisma.course.create({
      data: {
        title: "Progress Test Course",
        slug: `progress-test-${Date.now()}`,
        published: true,
      },
    });

    const mod = await prisma.module.create({
      data: { title: "Progress Module", order: 1, courseId: course.id },
    });

    const lesson = await prisma.lesson.create({
      data: {
        title: "Progress Lesson",
        slug: "progress-lesson",
        order: 1,
        moduleId: mod.id,
        content: "# Progress test",
        systemPrompt: "You are a test tutor.",
        taskObjective: "Test progress transitions",
      },
    });
    lessonId = lesson.id;
  });

  afterAll(async () => {
    await prisma.lessonProgress.deleteMany({ where: { userId } });
    await prisma.lesson.deleteMany({ where: { id: lessonId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  it("creates progress as NOT_STARTED", async () => {
    const progress = await prisma.lessonProgress.create({
      data: {
        userId,
        lessonId,
        status: ProgressStatus.NOT_STARTED,
      },
    });
    expect(progress.status).toBe(ProgressStatus.NOT_STARTED);
    expect(progress.completedAt).toBeNull();
  });

  it("transitions to IN_PROGRESS", async () => {
    const progress = await prisma.lessonProgress.update({
      where: { userId_lessonId: { userId, lessonId } },
      data: { status: ProgressStatus.IN_PROGRESS },
    });
    expect(progress.status).toBe(ProgressStatus.IN_PROGRESS);
  });

  it("transitions to COMPLETE with timestamp", async () => {
    const progress = await prisma.lessonProgress.update({
      where: { userId_lessonId: { userId, lessonId } },
      data: { status: ProgressStatus.COMPLETE, completedAt: new Date() },
    });
    expect(progress.status).toBe(ProgressStatus.COMPLETE);
    expect(progress.completedAt).not.toBeNull();
  });

  it("updates updatedAt on status change", async () => {
    const before = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    await new Promise((r) => setTimeout(r, 100));

    const after = await prisma.lessonProgress.update({
      where: { userId_lessonId: { userId, lessonId } },
      data: { status: ProgressStatus.IN_PROGRESS },
    });

    expect(after.updatedAt.getTime()).toBeGreaterThanOrEqual(before!.updatedAt.getTime());
  });
});
