import { z } from "zod";

const envSchema = z
  .object({
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32),
    NEXTAUTH_URL: z.string().url().optional(),
    NVIDIA_API_KEY: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
    SUPABASE_SERVICE_ROLE_KEY: z.string(),
  })
  .refine((env) => env.NVIDIA_API_KEY ?? env.GROQ_API_KEY, {
    message: "At least one of NVIDIA_API_KEY or GROQ_API_KEY must be set",
  });

export const env = envSchema.parse(process.env);
