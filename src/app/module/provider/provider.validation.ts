import z from "zod";

export const ApplyProviderZodSchema = z.object({
  address: z.string("Address is required").min(1, "Address is required"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
  phoneNumber: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "Invalid phone number")
    .optional(),
});
