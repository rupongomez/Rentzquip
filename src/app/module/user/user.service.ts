import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";

export const changeUserStatus = async (
  newStatus: UserStatus,
  userId: string,
) => {
  const getUser = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!getUser) {
    throw new Error("User not found");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: newStatus,
    },
  });

  return updatedUser;
};

export const getAllUsers = async () => {
  const getUsers = await prisma.user.findMany({
    omit: {
      password: true,
    },
  });
  return getUsers;
};

export const UserService = {
  changeUserStatus,
  getAllUsers,
};
