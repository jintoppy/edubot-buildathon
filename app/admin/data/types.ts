import { z } from "zod";

export const customDataSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type CustomData = z.infer<typeof customDataSchema>;
