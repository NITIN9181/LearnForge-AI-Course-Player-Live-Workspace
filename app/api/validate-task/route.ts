import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { validateTaskCompletion } from "@/lib/validate-task";

const validateInputSchema = z.object({
  taskObjective: z.string().min(1),
  lastUserMessage: z.string().min(1),
  conversationSummary: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = validateInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body", code: "VALIDATION_ERROR", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const result = await validateTaskCompletion(parsed.data);
    return Response.json({ data: result });
  } catch {
    return Response.json(
      { error: "Task validation failed", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
