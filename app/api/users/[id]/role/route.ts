import { NextRequest } from "next/server";
import { auth, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const RoleUpdateSchema = z.object({
  role: z.enum(["LEARNER", "ADMIN"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const adminCheck = await requireAdmin(session);
  if (!adminCheck.authorized) {
    return Response.json(
      { error: adminCheck.error, code: adminCheck.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN" },
      { status: adminCheck.status },
    );
  }

  const body = await req.json();
  const parsed = RoleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body", code: "VALIDATION_ERROR", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role: parsed.data.role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return Response.json({ data: user });
}
