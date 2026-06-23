import { z } from "zod";

export const CourseCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  published: z.boolean().default(false),
});

export const CourseUpdateSchema = CourseCreateSchema.partial();

export type CourseCreateInput = z.infer<typeof CourseCreateSchema>;
export type CourseUpdateInput = z.infer<typeof CourseUpdateSchema>;

export type CourseWithRelations = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  modules: Array<{
    id: string;
    title: string;
    order: number;
    lessons: Array<{
      id: string;
      title: string;
      slug: string;
      order: number;
    }>;
  }>;
};
