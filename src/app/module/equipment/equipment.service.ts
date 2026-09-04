import type { UploadApiResponse } from "cloudinary";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type { IEquipmentPayload, IEquipmentQuery } from "./equipment.interface";
import httpStatus from "http-status";
import { cloudinaryUpload } from "../../lib/cloudinary";
import type { EquipmentWhereInput } from "../../../generated/prisma/models";

const createEquipment = async (
	equipmentData: IEquipmentPayload,
	images: Express.Multer.File[],
	user: RequestUser,
) => {
	const getUser = await prisma.user.findFirst({
		where: {
			id: user.userId,
		},
	});

	if (!getUser) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	const isProviderExist = await prisma.provider.findFirst({
		where: {
			userId: user.userId,
		},
	});

	if (!isProviderExist) {
		throw new AppError(httpStatus.NOT_FOUND, "Provider not found");
	}

	const isCategoryExist = await prisma.category.findFirst({
		where: {
			id: equipmentData.categoryId,
		},
	});

	if (!isCategoryExist) {
		throw new AppError(httpStatus.NOT_FOUND, "Category not found");
	}

	const imageUploadResult = await Promise.all(
		images.map((img) => {
			return new Promise<UploadApiResponse>((resolve, reject) => {
				cloudinaryUpload.uploader
					.upload_stream(
						{
							resource_type: "image",
						},
						async (error, result) => {
							if (error) {
								return reject(error);
							}
							if (!result) {
								return reject(
									new AppError(httpStatus.BAD_REQUEST, "Image upload failed"),
								);
							}
							resolve(result);
						},
					)
					.end(img?.buffer);
			});
		}),
	);

	const newEquipment = await prisma.equipment.create({
		data: {
			name: equipmentData.name,
			categoryId: equipmentData.categoryId,
			brand: equipmentData.brand,
			description: equipmentData.description,
			model: equipmentData.model,
			quantity: equipmentData.quantity,
			rentalPrice: equipmentData.rentalPrice,
			securityDeposit: equipmentData.securityDeposit,
			imageUrl: imageUploadResult.map((img) => ({
				url: img.secure_url,
				publicId: img.public_id,
			})),
			providerId: isProviderExist.id,
		},
		include: {
			provider: true,
		},
	});

	return newEquipment;
};

const getAllEquipment = async (query: IEquipmentQuery) => {
	const limit = query.limit ? Number(query.limit) : 10;
	const page = query.page ? Number(query.page) : 1;
	const skip = (page - 1) * limit;
	const sortBy = query.sortBy ? query.sortBy : "createdAt";
	const sortOrder = query.sortOrder ? query.sortOrder : "desc";

	const andConditions: EquipmentWhereInput[] = [];

	if (query.searchTerm) {
		andConditions.push({
			OR: [
				{ name: { contains: query.searchTerm, mode: "insensitive" } },
				{ description: { contains: query.searchTerm, mode: "insensitive" } },
				{ model: { contains: query.searchTerm, mode: "insensitive" } },
				{ brand: { contains: query.searchTerm, mode: "insensitive" } },
			],
		});
	}

	if (query.sortBy) {
		andConditions.push({
			[query.sortBy]: {
				sortOrder: query.sortOrder,
			},
		});
	}

	const allEquipment = await prisma.equipment.findMany({
		where: {
			AND: andConditions,
		},
		take: limit,
		skip,
		orderBy: {
			[sortBy]: sortOrder,
		},
		include: {
			provider: true,
		},
	});
	return allEquipment;
};

const getSingleEquipment = async (equipmentId: string) => {
	const equipment = await prisma.equipment.findUnique({
		where: {
			id: equipmentId,
		},
		include: {
			provider: true,
		},
	});
	return equipment;
};

export const EquipmentService = {
	createEquipment,
	getAllEquipment,
	getSingleEquipment,
};
