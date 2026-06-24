export function createSSEStream(
  start: (controller: ReadableStreamDefaultController, encoder: TextEncoder) => Promise<void>,
): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        await start(controller, encoder);
      } catch {
        sendSSEFrame(controller, encoder, { error: "Internal server error" });
        controller.close();
      }
    },
  });
}

export function sendSSEFrame(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  data: Record<string, unknown>,
): void {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
}

export function sendSSEDone(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
): void {
  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
}

export function createSSEResponse(stream: ReadableStream): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
