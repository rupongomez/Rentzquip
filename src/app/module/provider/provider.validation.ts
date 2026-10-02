import z from "zod";

export const ApplyProviderZodSchema = z.object({
  address: z.string("Address is required").min(1, "Address is required"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters"),
  phoneNumber: z
    .string()
    .regex(/^(?:\+?880|0)1[3-9]\d{8}$/, "Invalid phone number"),
});
