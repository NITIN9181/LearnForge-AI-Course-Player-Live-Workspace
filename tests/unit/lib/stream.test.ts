import { describe, it, expect, vi } from "vitest";
import { sendSSEFrame, sendSSEDone, createSSEStream, createSSEResponse } from "@/lib/stream";

function createMockController() {
  const encoder = new TextEncoder();
  const enqueue = vi.fn();
  const close = vi.fn();
  const controller = {
    enqueue,
    close,
    desiredSize: 1,
  } as unknown as ReadableStreamDefaultController;
  return { controller, encoder, enqueue, close };
}

describe("sendSSEFrame", () => {
  it("encodes data as SSE frame with double newline", () => {
    const { controller, encoder, enqueue } = createMockController();
    sendSSEFrame(controller, encoder, { message: "hello" });
    expect(enqueue).toHaveBeenCalledWith(encoder.encode('data: {"message":"hello"}\n\n'));
  });

  it("handles objects with multiple keys", () => {
    const { controller, encoder, enqueue } = createMockController();
    sendSSEFrame(controller, encoder, { a: 1, b: "two" });
    const call = enqueue.mock.calls[0]![0]! as Uint8Array;
    const decoded = new TextDecoder().decode(call);
    expect(decoded).toMatch(/^data: /);
    expect(decoded).toMatch(/\n\n$/);
    expect(decoded).toContain('"a":1');
    expect(decoded).toContain('"b":"two"');
  });
});

describe("sendSSEDone", () => {
  it("sends the DONE signal", () => {
    const { controller, encoder, enqueue } = createMockController();
    sendSSEDone(controller, encoder);
    expect(enqueue).toHaveBeenCalledWith(encoder.encode("data: [DONE]\n\n"));
  });
});

describe("createSSEStream", () => {
  it("creates a ReadableStream and calls the start function", async () => {
    const startFn = vi.fn(async () => {
      // start function does nothing
    });

    const stream = createSSEStream(startFn);
    expect(stream).toBeInstanceOf(ReadableStream);
  });

  it("sends an error frame when start function throws", async () => {
    const startFn = vi.fn(async () => {
      throw new Error("test error");
    });

    const stream = createSSEStream(startFn);
    const reader = stream.getReader();
    const result = await reader.read();

    const decoder = new TextDecoder();
    const frame = decoder.decode(result.value as Uint8Array);
    expect(frame).toContain("Internal server error");

    const done = await reader.read();
    expect(done.done).toBe(true);
  });
});

describe("createSSEResponse", () => {
  it("returns a Response with correct SSE headers", () => {
    const stream = new ReadableStream();
    const response = createSSEResponse(stream);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(response.headers.get("Cache-Control")).toBe("no-cache");
    expect(response.headers.get("Connection")).toBe("keep-alive");
  });
});
