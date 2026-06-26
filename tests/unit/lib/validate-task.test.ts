import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@langchain/openai", () => {
  const MockChatOpenAI = vi.fn();
  MockChatOpenAI.prototype.invoke = vi.fn();

  return { ChatOpenAI: MockChatOpenAI };
});

vi.mock("@/lib/env", () => ({
  env: {
    NVIDIA_API_KEY: "test-key",
  },
}));

import { validateTaskCompletion } from "@/lib/validate-task";

describe("validateTaskCompletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns achieved=true when task is completed", async () => {
    const { ChatOpenAI } = await import("@langchain/openai");
    const mockInstance = new ChatOpenAI();
    (mockInstance.invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: JSON.stringify({
        achieved: true,
        feedback: "Great work! You completed the task.",
        confidence: 0.95,
      }),
    });

    const result = await validateTaskCompletion({
      taskObjective: "Write a zero-shot prompt",
      lastUserMessage: "Here is my prompt...",
      conversationSummary: "The learner discussed prompting concepts.",
    });

    expect(result.achieved).toBe(true);
    expect(result.feedback).toBeTruthy();
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it("returns achieved=false when task is not completed", async () => {
    const { ChatOpenAI } = await import("@langchain/openai");
    const mockInstance = new ChatOpenAI();
    (mockInstance.invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
      content: JSON.stringify({
        achieved: false,
        feedback: "You need to provide a specific example.",
        confidence: 0.8,
      }),
    });

    const result = await validateTaskCompletion({
      taskObjective: "Write a zero-shot prompt",
      lastUserMessage: "I don't understand.",
      conversationSummary: "The learner is confused.",
    });

    expect(result.achieved).toBe(false);
  });
});
