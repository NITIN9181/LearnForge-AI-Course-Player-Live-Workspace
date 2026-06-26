import { describe, it, expect } from "vitest";
import { chatMessageSchema, chatRequestSchema } from "@/types/workspace";

describe("chatMessageSchema", () => {
  it("accepts a valid user message", () => {
    const result = chatMessageSchema.safeParse({
      role: "user",
      content: "Hello",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid assistant message", () => {
    const result = chatMessageSchema.safeParse({
      role: "assistant",
      content: "Hi there!",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid system message", () => {
    const result = chatMessageSchema.safeParse({
      role: "system",
      content: "You are a tutor.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid role", () => {
    const result = chatMessageSchema.safeParse({
      role: "admin",
      content: "Hello",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing content", () => {
    const result = chatMessageSchema.safeParse({
      role: "user",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty content", () => {
    const result = chatMessageSchema.safeParse({
      role: "user",
      content: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects null", () => {
    const result = chatMessageSchema.safeParse(null);
    expect(result.success).toBe(false);
  });
});

describe("chatRequestSchema", () => {
  it("accepts a valid request", () => {
    const result = chatRequestSchema.safeParse({
      lessonId: "lesson-1",
      messages: [{ role: "user", content: "Hello" }],
      model: "70b",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a request without model", () => {
    const result = chatRequestSchema.safeParse({
      lessonId: "lesson-1",
      messages: [{ role: "user", content: "Hello" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing lessonId", () => {
    const result = chatRequestSchema.safeParse({
      messages: [{ role: "user", content: "Hello" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty lessonId", () => {
    const result = chatRequestSchema.safeParse({
      lessonId: "",
      messages: [{ role: "user", content: "Hello" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty messages array", () => {
    const result = chatRequestSchema.safeParse({
      lessonId: "lesson-1",
      messages: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid message in array", () => {
    const result = chatRequestSchema.safeParse({
      lessonId: "lesson-1",
      messages: [{ role: "invalid", content: "Hello" }],
    });
    expect(result.success).toBe(false);
  });
});
