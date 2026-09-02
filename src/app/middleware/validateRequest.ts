import z from "zod";
import { catchAsync } from "../utils/catchAsync";
import { NextFunction, Response, Request } from "express";
import { AppError } from "../utils/AppError";
import httpStatus from "http-status";

export const validateRequest = (ZodSchema: z.ZodObject) => {
  return catchAsync((req: Request, res: Response, next: NextFunction) => {
    const payload = req.body ?? {};
    const result = ZodSchema.safeParse(payload);

    if (!result.success) {
      console.log(result.error);
      console.log(result.error.issues);
      throw new AppError(
        httpStatus.BAD_REQUEST,
        result.error.issues[0].message,
      );
    }

    req.body = result.data;
    next();
  });
};
