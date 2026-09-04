import z from "zod";

export const CreateEquipmentZodSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	model: z.string().optional(),
	brand: z.string().optional(),
	quantity: z.number().default(1).optional(),
	rentalPrice: z.number().positive(),
	securityDeposit: z.number().positive(),
	categoryId: z.string().uuid(),
});
