import bcrypt from "bcryptjs";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import {
  IGoogleLoginPayload,
  ILoginUserPayload,
  IRegisterUserPayload,
  IRequestUser,
} from "./auth.interface";
import {
  AuthProvider,
  Role,
  UserStatus,
} from "../../../generated/prisma/enums";
import crypto from "crypto";
import { redisClient } from "../../lib/redis";
import path from "path";
import ejs from "ejs";
import { transporter } from "../../lib/nodemailer";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { TokenPayload } from "google-auth-library";
import { googleClient } from "../../lib/googleAuth";

const registerUser = async (payload: IRegisterUserPayload) => {
  const { name, password, role } = payload;
  const email = payload.email.trim().toLowerCase();

  if (role !== Role.CUSTOMER && role !== Role.PROVIDER) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid role");
  }

  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User with this email already exists",
    );
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role,
      status: UserStatus.ACTIVE,
      emailVerified: false,
      isDeleted: false,
    },
    omit: { password: true },
  });

  const expirationSeconds = 5 * 60;
  const otpKey = `rentzquip-user-registration-otp:${email}`;

  const otpValue = crypto.randomInt(100000, 1000000).toString();
  await redisClient.set(otpKey, otpValue, {
    expiration: {
      type: "EX",
      value: expirationSeconds,
    },
  });

  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/register-user-otp.ejs",
  );

  const templateData = {
    name: createdUser.name,
    otp: otpValue,
    expirationMinutes: expirationSeconds / 60,
  };

  const html = await ejs.renderFile(templatePath, templateData);

  await transporter.sendMail({
    from: config.smtp_user,
    to: createdUser.email,
    subject: "Verify your email address",
    html: html,
  });
};

const verifyUserOtp = async (email: string, otp: string) => {
  if (!email || !otp) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email and OTP are required");
  }

  const otpKey = `rentzquip-user-registration-otp:${email}`;
  const storedOtp = await redisClient.get(otpKey);

  if (!storedOtp) {
    throw new AppError(httpStatus.NOT_FOUND, "OTP not found or expired");
  }

  if (otp !== storedOtp) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid OTP");
  }

  const user = await prisma.user.update({
    where: { email },
    data: { emailVerified: true },
    omit: { password: true },
  });

  await redisClient.del(otpKey);

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: ILoginUserPayload) => {
  const { password } = payload;
  const email = payload.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "User is blocked");
  }

  if (user.isDeleted === true) {
    throw new AppError(httpStatus.GONE, "User is deleted");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password!);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const resendOtp = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.emailVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email is already verified");
  }

  const expirationSeconds = 5 * 60;
  const otpKey = `rentzquip-user-registration-otp:${email}`;

  const otpValue = crypto.randomInt(100000, 1000000).toString();
  await redisClient.set(otpKey, otpValue, {
    expiration: {
      type: "EX",
      value: expirationSeconds,
    },
  });

  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/register-user-otp.ejs",
  );

  const templateData = {
    name: user.name,
    otp: otpValue,
    expirationMinutes: expirationSeconds / 60,
  };

  const html = await ejs.renderFile(templatePath, templateData);

  await transporter.sendMail({
    from: config.smtp_user,
    to: user.email,
    subject: "Verify your email address",
    html: html,
  });
};

const forgotPassword = async (email: string) => {
  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email is required");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const expirationSeconds = 5 * 60;
  const otpKey = `rentzquip-user-forget-password-otp:${email}`;

  const otpValue = crypto.randomInt(100000, 1000000).toString();
  await redisClient.set(otpKey, otpValue, {
    expiration: {
      type: "EX",
      value: expirationSeconds,
    },
  });

  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/forgot-password-otp.ejs",
  );

  const templateData = {
    name: user.name,
    otp: otpValue,
    expirationMinutes: expirationSeconds / 60,
  };

  const html = await ejs.renderFile(templatePath, templateData);

  await transporter.sendMail({
    from: config.smtp_user,
    to: user.email,
    subject: "Reset your password",
    html: html,
  });
};

const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  if (!email || !otp || !newPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Email, OTP and new password are required",
    );
  }

  if (!email || !otp) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email and OTP are required");
  }

  const otpKey = `rentzquip-user-forget-password-otp:${email}`;
  const storedOtp = await redisClient.get(otpKey);

  if (!storedOtp) {
    throw new AppError(httpStatus.NOT_FOUND, "OTP not found or expired");
  }

  if (otp !== storedOtp) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid OTP");
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
    omit: { password: true },
  });

  await redisClient.del(otpKey);

  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/password-reset-successful.ejs",
  );

  const loginUrl = `${config.frontend_url}/login`;

  const templateData = {
    name: user.name,
    loginUrl: loginUrl,
  };

  const html = await ejs.renderFile(templatePath, templateData);

  await transporter.sendMail({
    from: config.smtp_user,
    to: user.email,
    subject: "Reset your password",
    html: html,
  });
};

const getMe = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    omit: {
      password: true,
    },
  });

  if (!isUserExists) {
    throw new Error("User not found");
  }

  return isUserExists;
};

const refreshToken = async (token: string) => {
  const verifiedRefreshToken = jwtUtils.verifyToken(
    token,
    config.jwt_refresh_secret,
  );

  if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
    throw new Error(
      config.node_env === "development"
        ? verifiedRefreshToken.error
        : "Invalid refresh token",
    );
  }

  const data = verifiedRefreshToken.data as JwtPayload;

  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
    throw new Error("User is inactive or not found");
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const loginWithGoogle = async (payload: IGoogleLoginPayload) => {
  let googleIdTokenPayload: TokenPayload | null | undefined = null;

  try {
    const ticket = googleClient.verifyIdToken({
      idToken: payload.idToken,
      audience: config.google_client_id,
    });

    googleIdTokenPayload = (await ticket).getPayload();
  } catch (error) {
    console.log("Google ID token verification failed", error);
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Google ID token");
  }

  if (!googleIdTokenPayload) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Google email was not found in the ID token payload",
    );
  }

  if (!googleIdTokenPayload.email) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Google ID token does not contain an email",
    );
  }

  if (!googleIdTokenPayload.name) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Google ID token does not contain a name",
    );
  }

  const isUserExists = await prisma.user.findUnique({
    where: {
      email: googleIdTokenPayload.email,
      googleId: googleIdTokenPayload.sub,
    },
  });

  let user = isUserExists;

  if (!isUserExists) {
    const isUserExistWithCredentials = await prisma.user.findUnique({
      where: {
        email: googleIdTokenPayload.email,
        authProvider: AuthProvider.CREDENTIALS,
      },
    });

    if (isUserExistWithCredentials) {
      if (isUserExistWithCredentials.status === UserStatus.BLOCKED) {
        throw new AppError(httpStatus.FORBIDDEN, "User is blocked");
      }
      if (isUserExistWithCredentials.isDeleted === true) {
        throw new AppError(httpStatus.GONE, "User is deleted");
      }

      user = await prisma.user.update({
        where: {
          email: googleIdTokenPayload.email,
        },
        data: {
          googleId: googleIdTokenPayload.sub,
          authProvider: AuthProvider.GOOGLE,
          avatar: googleIdTokenPayload.picture,
        },
      });

      if (!isUserExistWithCredentials.emailVerified) {
        await prisma.user.update({
          where: {
            email: googleIdTokenPayload.email,
          },
          data: {
            emailVerified: true,
          },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          name: googleIdTokenPayload.name,
          email: googleIdTokenPayload.email,
          googleId: googleIdTokenPayload.sub,
          authProvider: AuthProvider.GOOGLE,
          emailVerified: true,
          role: Role.CUSTOMER,
          avatar: googleIdTokenPayload.picture,
        },
      });

      const templatePath = path.join(
        process.cwd(),
        "src/app/templates/welcome-user.ejs",
      );

      const loginUrl = `${config.frontend_url}/login`;

      const templateData = {
        name: user.name,
        loginUrl: loginUrl,
      };
      const html = await ejs.renderFile(templatePath, templateData);

      await transporter.sendMail({
        from: config.email_sender,
        to: user.email,
        subject: "Welcome to Rentzquip - A Equipment Rental Platform",
        html,
      });
    }
  }

  if (!user) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "User creation or retrieval failed",
    );
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "User is blocked");
  }

  if (user.isDeleted === true) {
    throw new AppError(httpStatus.GONE, "User is deleted");
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const AuthService = {
  registerUser,
  loginUser,
  resendOtp,
  forgotPassword,
  resetPassword,
  loginWithGoogle,
  getMe,
  refreshToken,
  verifyUserOtp,
};
