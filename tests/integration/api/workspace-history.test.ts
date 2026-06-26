import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db";

describe("WorkspaceConversation", () => {
  let userId: string;
  let lessonId: string;
  let conversationId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `workspace-test-${Date.now()}@test.dev`,
        name: "Workspace Test User",
        password: "test-password",
      },
    });
    userId = user.id;

    const course = await prisma.course.create({
      data: {
        title: "Workspace Test Course",
        slug: `workspace-test-${Date.now()}`,
        published: true,
      },
    });

    const mod = await prisma.module.create({
      data: { title: "Workspace Module", order: 1, courseId: course.id },
    });

    const lesson = await prisma.lesson.create({
      data: {
        title: "Workspace Lesson",
        slug: "workspace-lesson",
        order: 1,
        moduleId: mod.id,
        content: "# Workspace test",
        systemPrompt: "You are a test tutor.",
        taskObjective: "Test workspace history",
      },
    });
    lessonId = lesson.id;
  });

  afterAll(async () => {
    await prisma.workspaceConversation.deleteMany({
      where: { userId, lessonId },
    });
    await prisma.lessonProgress.deleteMany({ where: { userId } });
    await prisma.enrollment.deleteMany({ where: { userId } });
    await prisma.lesson.deleteMany({ where: { id: lessonId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  it("saves a conversation", async () => {
    const conv = await prisma.workspaceConversation.create({
      data: {
        userId,
        lessonId,
        messages: [
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi there!" },
        ],
        lastTokensUsed: 150,
      },
    });
    conversationId = conv.id;
    expect(conv.messages).toHaveLength(2);
    expect(conv.lastTokensUsed).toBe(150);
  });

  it("retrieves a conversation", async () => {
    const conv = await prisma.workspaceConversation.findUnique({
      where: { id: conversationId },
    });
    expect(conv).not.toBeNull();
    expect(conv!.messages).toHaveLength(2);
  });

  it("appends messages to an existing conversation", async () => {
    const existing = await prisma.workspaceConversation.findUnique({
      where: { id: conversationId },
    });

    const newMessages = [
      ...(existing!.messages as Array<{ role: string; content: string }>),
      { role: "user", content: "Another question" },
    ];

    const updated = await prisma.workspaceConversation.update({
      where: { id: conversationId },
      data: {
        messages: newMessages,
        lastTokensUsed: 200,
      },
    });
    expect(updated.messages).toHaveLength(3);
    expect(updated.lastTokensUsed).toBe(200);
  });

  it("clears messages via empty array", async () => {
    const cleared = await prisma.workspaceConversation.update({
      where: { id: conversationId },
      data: { messages: [], lastTokensUsed: null },
    });
    expect(cleared.messages).toHaveLength(0);
    expect(cleared.lastTokensUsed).toBeNull();
  });
});
