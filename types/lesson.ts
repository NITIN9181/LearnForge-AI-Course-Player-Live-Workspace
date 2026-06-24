import { z } from "zod";

export const LessonCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().optional(),
  order: z.number().int().min(0),
  moduleId: z.string().min(1),
  content: z.string().default(""),
  systemPrompt: z.string().default(""),
  hintSystemPrompt: z.string().optional(),
  taskObjective: z.string().optional(),
});

export const LessonUpdateSchema = LessonCreateSchema.partial().omit({ moduleId: true }).extend({
  moduleId: z.string().optional(),
});

export const LessonReorderSchema = z.object({
  lessonId: z.string(),
  newOrder: z.number().int().min(0),
  moduleId: z.string(),
});

export const LessonBatchReorderSchema = z.object({
  lessons: z.array(LessonReorderSchema),
});

export type LessonCreateInput = z.infer<typeof LessonCreateSchema>;
export type LessonUpdateInput = z.infer<typeof LessonUpdateSchema>;
export type LessonReorderInput = z.infer<typeof LessonReorderSchema>;
export type LessonBatchReorderInput = z.infer<typeof LessonBatchReorderSchema>;

export type LessonWithModule = {
  id: string;
  title: string;
  slug: string;
  order: number;
  moduleId: string;
  content: string;
  systemPrompt: string;
  hintSystemPrompt: string | null;
  taskObjective: string | null;
  prerequisiteId: string | null;
  createdAt: Date;
  updatedAt: Date;
  module: {
    id: string;
    title: string;
    order: number;
  };
};
