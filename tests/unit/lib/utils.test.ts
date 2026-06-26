import { describe, it, expect } from "vitest";
import { slugify, formatTokens } from "@/lib/utils";

describe("slugify", () => {
  it("converts spaces to hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips special characters", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("handles multiple spaces", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });

  it("handles underscores", () => {
    expect(slugify("hello_world")).toBe("hello-world");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("--hello-world--")).toBe("hello-world");
  });

  it("returns lowercase", () => {
    expect(slugify("HELLO World")).toBe("hello-world");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("leaves single hyphens intact between words", () => {
    expect(slugify("hello-world")).toBe("hello-world");
  });
});

describe("formatTokens", () => {
  it("returns zero message for 0", () => {
    expect(formatTokens(0)).toBe("0 tokens used");
  });

  it("formats a small count", () => {
    expect(formatTokens(847)).toBe("847 tokens used");
  });

  it("formats a count with thousands separator", () => {
    expect(formatTokens(3241)).toBe("3,241 tokens used");
  });

  it("formats a large count with locale formatting", () => {
    const result = formatTokens(1234567);
    expect(result).toMatch(/tokens used$/);
    expect(result).not.toBe("0 tokens used");
  });
});
