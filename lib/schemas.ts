import { z } from "zod";

export const TimeEntryCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid YYYY-MM-DD"),
  category: z.string().min(2),
  durationHours: z
    .number()
    .min(0.25)
    .max(12)
    .refine((v) => v % 0.25 === 0, "Must be 0.25 step"),
  note: z.string().min(3),
});

export const CategoryCreateSchema = z.object({
  name: z.string().min(1),
});

export type TimeEntryCreate = z.infer<typeof TimeEntryCreateSchema>;
export type CategoryCreate = z.infer<typeof CategoryCreateSchema>;
