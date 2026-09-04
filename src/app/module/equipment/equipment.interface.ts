export interface IEquipmentPayload {
	name: string;
	description?: string;
	categoryId: string;
	model?: string;
	brand?: string;
	quantity?: number;
	rentalPrice: number;
	securityDeposit: number;
}

export interface IEquipmentQuery {
	limit?: number;
	page?: number;
	skip?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	searchTerm?: string;
}
