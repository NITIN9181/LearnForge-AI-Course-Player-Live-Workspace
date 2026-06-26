import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

describe("Courses API", () => {
  const title = "Test Course " + Date.now();
  let courseId: string;

  beforeAll(async () => {
    const course = await prisma.course.create({
      data: {
        title,
        slug: slugify(title),
        description: "Integration test course",
        published: true,
      },
    });
    courseId = course.id;
  });

  afterAll(async () => {
    await prisma.course.deleteMany({ where: { id: courseId } });
  });

  it("creates a course with slug", async () => {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    expect(course).not.toBeNull();
    expect(course!.title).toBe(title);
    expect(course!.slug).toBe(slugify(title));
  });

  it("reads a course by id", async () => {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    expect(course).not.toBeNull();
  });

  it("updates a course", async () => {
    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { description: "Updated description" },
    });
    expect(updated.description).toBe("Updated description");
  });

  it("lists published courses", async () => {
    const courses = await prisma.course.findMany({
      where: { published: true },
    });
    expect(courses.length).toBeGreaterThanOrEqual(1);
  });

  it("deletes a course", async () => {
    const course = await prisma.course.create({
      data: {
        title: "Temp Course",
        slug: "temp-course-" + Date.now(),
        published: false,
      },
    });
    await prisma.course.delete({ where: { id: course.id } });
    const found = await prisma.course.findUnique({ where: { id: course.id } });
    expect(found).toBeNull();
  });
});
