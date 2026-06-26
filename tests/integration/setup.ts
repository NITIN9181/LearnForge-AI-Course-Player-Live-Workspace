import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import path from "path";

export const prisma = new PrismaClient();

const dbUrl = process.env.DATABASE_URL ?? "";
const isTestSchema = dbUrl.includes("schema=test");

if (isTestSchema) {
  const schemaPath = path.resolve(__dirname, "../../prisma/schema.prisma");
  execSync(`npx prisma migrate deploy --schema="${schemaPath}"`, {
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: "pipe",
  });
}
