import bcrypt from "bcryptjs";
import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import { AppError } from "./AppError";
import httpStatus from "http-status";

export const seedTestAdmin = async () => {
	try {
		const isTestAdminExists = await prisma.user.findFirst({
			where: {
				role: Role.ADMIN,
				email: config.test_admin_email,
			},
		});

		if (isTestAdminExists) {
			console.log("Test admin already exists.");
			return;
		}

		const name = config.test_admin_name;
		const email = config.test_admin_email;
		const password = config.test_admin_password;

		if (!name || !email || !password) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Test admin credentials are not set in the environment variables.",
			);
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const createTestAdmin = await prisma.user.create({
			data: {
				name,
				password: hashedPassword,
				email,
				role: Role.ADMIN,
				emailVerified: true,
			},
		});

		console.log("Test admin is created", createTestAdmin);
	} catch (error) {
		console.error("Error seeding test admin:", error);
	}
};
export const seedTestMod = async () => {
	try {
		const isTestModExists = await prisma.user.findFirst({
			where: {
				role: Role.MODERATOR,
				email: config.test_mod_email,
			},
		});

		if (isTestModExists) {
			console.log("Test moderator already exists.");
			return;
		}

		const name = config.test_mod_name;
		const email = config.test_mod_email;
		const password = config.test_mod_password;

		if (!name || !email || !password) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Test moderator credentials are not set in the environment variables.",
			);
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const createTestMod = await prisma.user.create({
			data: {
				name,
				password: hashedPassword,
				email,
				role: Role.MODERATOR,
				emailVerified: true,
			},
		});

		console.log("Test moderator is created", createTestMod);
	} catch (error) {
		console.error("Error seeding test moderator:", error);
	}
};
