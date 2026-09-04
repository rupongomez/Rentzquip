import { Router } from "express";
import { CategoryController } from "./category.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { categoryPayloadValidationZodSchema } from "./category.validations";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";

const router = Router();

router.post(
  "/create",
  validateRequest(categoryPayloadValidationZodSchema),
  auth(Role.ADMIN, Role.MODERATOR),
  CategoryController.createCategory,
);

router.get("/", CategoryController.getCategories);

export const CategoryRoute = router;
