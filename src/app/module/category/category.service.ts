import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";

const createCategory = async (
	categoryPayloadData: ICategoryPayload,
	user: RequestUser,
) => {
	const { name, description } = categoryPayloadData;

	const createCategory = await prisma.category.create({
		data: { name, description, createdById: user.userId },
	});

	return createCategory;
};

const getCategories = async () => {
	const categories = await prisma.category.findMany({});

	return categories;
};

export const CategoryService = {
	createCategory,
	getCategories,
};
