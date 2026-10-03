import { ProviderStatus } from "../../../generated/prisma/enums";

export interface ProviderPayload {
  address: string;
  description: string;
  imageUrl?: string;
  phoneNumber: string;
}

export interface IProviderQuery {
  limit?: number;
  page?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
  status?: ProviderStatus;
}
