import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { UserController } from "./user.controller";

const router = Router();

router.patch(
  "/change-status/:userId",
  auth(Role.ADMIN, Role.PROVIDER),
  UserController.changeUserStatus,
);

router.get("/all", auth(Role.ADMIN), UserController.getAllUsers);

export const UserRoute = router;
