import { z } from "zod";

export const createPlaceSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().min(5, "Description must be at least 5 characters."),
  address: z.string().trim().min(1, "Address is required."),
});

export const updatePlaceSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().min(5, "Description must be at least 5 characters."),
});
