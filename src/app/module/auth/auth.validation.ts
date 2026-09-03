import z from "zod";
import { Role } from "../../../generated/prisma/enums";

export const RegisterUserValidationZodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  role: z.enum([Role.CUSTOMER, Role.PROVIDER]),
  password: z
    .string()
    .min(8, "Password must be atleast 8 character long")
    .regex(/[A-Z]/, "Password must contain atleast 1 uppercase character")
    .regex(/[a-z]/, "Password must contain atleast 1 lowercase character")
    .regex(/[0-9]/, "Password must contain atleast 1 numberr")
    .regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 special character"),
});
